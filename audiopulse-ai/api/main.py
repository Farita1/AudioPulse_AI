import os
import io
import librosa
import numpy as np
import pandas as pd
import joblib
import boto3
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Cargamos las variables de entorno desde el archivo .env en la raíz
load_dotenv()

# Inicializamos la aplicación FastAPI
app = FastAPI(
    title="AudioPulse AI API",
    description="API de Machine Learning con almacenamiento en AWS S3 para señales biométricas cardíacas.",
    version="1.1.1"
)

# Configuración de CORS para el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializamos el cliente de AWS S3 usando las variables de entorno
try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION')
    )
    BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    REGION = os.getenv('AWS_REGION')
    print(f"☁️ Conexión inicializada con el bucket S3: {BUCKET_NAME}")
except Exception as e:
    s3_client = None
    print(f"❌ Error al conectar con AWS S3: {e}")

# Rutas absolutas para el modelo de ML
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'heartbeat_classifier.joblib')

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print(f"¡Modelo de IA cargado exitosamente desde {MODEL_PATH}!")
else:
    model = None
    print(f"⚠️ Advertencia: No se encontró ningún modelo en {MODEL_PATH}.")

CLASS_MAPPING = {
    0: "Normal",
    1: "Anómalo (Soplo / Murmur)"
}

# Estructura de respuesta que incluye los datos de AWS
class PredictionResponse(BaseModel):
    filename: str
    prediction_code: int
    diagnosis: str
    probability: float
    s3_url: str
    status: str

def process_live_audio(audio_bytes, n_mfcc=13):
    """ Extrae las características acústicas MFCC del audio en memoria """
    audio_file = io.BytesIO(audio_bytes)
    audio, sample_rate = librosa.load(audio_file, sr=None)
    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=n_mfcc)
    mfccs_processed = np.mean(mfccs.T, axis=0)
    return mfccs_processed.reshape(1, -1)

def upload_to_s3(audio_bytes, filename, folder):
    """ Sube el archivo de audio a AWS S3 de forma organizada y genera su URL pública """
    if not s3_client:
        return "S3_NOT_CONFIGURED"
        
    # Añadimos un timestamp al nombre para evitar colisiones/duplicados en S3
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    s3_filename = f"{folder}/{timestamp}_{filename}"
    
    try:
        # Subimos los bytes del archivo directamente
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_filename,
            Body=audio_bytes,
            ContentType='audio/wav'
        )
        # Construimos la URL de acceso del objeto guardado
        url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{s3_filename}"
        return url
    except Exception as e:
        print(f"Error subiendo a S3: {str(e)}")
        return "UPLOAD_FAILED"

@app.get("/")
def read_root():
    return {
        "message": "AudioPulse AI API activa",
        "model_loaded": model is not None,
        "s3_connected": s3_client is not None,
        "status": "Online"
    }

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_heartbeat(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="El modelo de IA no está disponible.")
    
    if not file.filename.lower().endswith(('.wav', '.mp3')):
        raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Debe ser .wav o .mp3")
    
    try:
        # Leemos los bytes del audio entrante
        audio_bytes = await file.read()
        
        # 1. Ejecutamos el pipeline DSP local sobre los bytes
        features_array = process_live_audio(audio_bytes)
        
        # CORRECCIÓN DE ADVERTENCIA: Convertimos el array de NumPy en un DataFrame de Pandas
        # asignando explícitamente los mismos nombres de columnas con los que se entrenó el modelo.
        feature_names = [f'mfcc_{i+1}' for i in range(features_array.shape[1])]
        features_df = pd.DataFrame(features_array, columns=feature_names)
        
        # 2. Ejecutamos inferencia usando el DataFrame estructurado
        prediction = int(model.predict(features_df)[0])
        probabilities = model.predict_proba(features_df)[0]
        confidence = float(probabilities[prediction])
        
        diagnosis_text = CLASS_MAPPING.get(prediction, "Desconocido")
        
        # 3. Definimos carpeta de destino en S3 según el diagnóstico para estructurar la data médica
        s3_folder = "predicciones/normales" if prediction == 0 else "predicciones/anomalos"
        
        # 4. Subimos el archivo a la nube de AWS
        s3_url = upload_to_s3(audio_bytes, file.filename, s3_folder)
        
        return PredictionResponse(
            filename=file.filename,
            prediction_code=prediction,
            diagnosis=diagnosis_text,
            probability=round(confidence, 4),
            s3_url=s3_url,
            status="success"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")