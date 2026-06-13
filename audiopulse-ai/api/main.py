import os
import io
import librosa
import numpy as np
import pandas as pd
import joblib
import boto3
from datetime import datetime
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Importaciones de nuestro nuevo módulo de Base de Datos
from .database import engine, Base, get_db
from .models_db import PacienteScreening

load_dotenv()

# Creamos las tablas de la base de datos en Postgres al arrancar
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AudioPulse AI API",
    description="API de Machine Learning con persistencia en PostgreSQL y AWS S3.",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializamos cliente de S3
try:
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION')
    )
    BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    REGION = os.getenv('AWS_REGION')
    print(f"☁️ Conexión S3 activa: {BUCKET_NAME}")
except Exception as e:
    s3_client = None
    print(f"❌ Error S3: {e}")

# Cargar Modelo de IA
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'heartbeat_classifier.joblib')

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("¡Modelo de IA cargado exitosamente!")
else:
    model = None

CLASS_MAPPING = {0: "Normal", 1: "Anómalo (Soplo / Murmur)"}

# Esquemas de Pydantic para validación de respuestas
class PredictionResponse(BaseModel):
    id: int
    cedula_paciente: str
    nombre_paciente: str
    filename: str
    diagnosis: str
    probability: float
    s3_url: str
    created_at: datetime

    class Config:
        from_attributes = True

def process_live_audio(audio_bytes, n_mfcc=13):
    audio_file = io.BytesIO(audio_bytes)
    audio, sample_rate = librosa.load(audio_file, sr=None)
    mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=n_mfcc)
    mfccs_processed = np.mean(mfccs.T, axis=0)
    return mfccs_processed.reshape(1, -1)

def upload_to_s3(audio_bytes, filename, folder):
    if not s3_client:
        return "S3_NOT_CONFIGURED"
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    s3_filename = f"{folder}/{timestamp}_{filename}"
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_filename,
            Body=audio_bytes,
            ContentType='audio/wav'
        )
        return f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{s3_filename}"
    except Exception as e:
        print(f"Error S3: {e}")
        return "UPLOAD_FAILED"

@app.get("/")
def read_root():
    return {"message": "AudioPulse AI API v1.2.0 activa", "status": "Online"}

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_heartbeat(
    cedula: str = Form(...),
    nombre: str = Form(...),
    edad: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if model is None:
        raise HTTPException(status_code=500, detail="El modelo de IA no está disponible.")
    
    if not file.filename.lower().endswith(('.wav', '.mp3')):
        raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Debe ser .wav")
    
    try:
        audio_bytes = await file.read()
        
        # 1. Pipeline de DSP e Inferencia
        features_array = process_live_audio(audio_bytes)
        feature_names = [f'mfcc_{i+1}' for i in range(features_array.shape[1])]
        features_df = pd.DataFrame(features_array, columns=feature_names)
        
        prediction = int(model.predict(features_df)[0])
        probabilities = model.predict_proba(features_df)[0]
        confidence = float(probabilities[prediction])
        diagnosis_text = CLASS_MAPPING.get(prediction, "Desconocido")
        
        # 2. Persistencia en AWS S3
        s3_folder = "predicciones/normales" if prediction == 0 else "predicciones/anomalos"
        s3_url = upload_to_s3(audio_bytes, file.filename, s3_folder)
        
        # 3. Persistencia en Base de Datos PostgreSQL
        nuevo_registro = PacienteScreening(
            cedula_paciente=cedula,
            nombre_paciente=nombre,
            edad_paciente=edad,
            filename=file.filename,
            diagnosis=diagnosis_text,
            probability=round(confidence, 4),
            s3_url=s3_url
        )
        
        db.add(nuevo_registro)
        db.commit()
        db.refresh(nuevo_registro)  # Nos devuelve el registro con su ID auto-generado
        
        return nuevo_registro
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")

@app.get("/api/v1/history", response_model=List[PredictionResponse])
def get_screening_history(db: Session = Depends(get_db)):
    """ Retorna el historial clínico completo ordenado desde el más reciente """
    return db.query(PacienteScreening).order_by(PacienteScreening.created_at.desc()).all()