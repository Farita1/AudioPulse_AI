import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

def train_heartbeat_model(csv_path, model_output_path):
    """
    Carga las características extraídas desde el CSV, entrena un clasificador
    Random Forest y guarda el modelo entrenado para su posterior uso en la API.
    """
    if not os.path.exists(csv_path):
        print(f"Error: No se encontró el archivo CSV en {csv_path}. ¿Ejecutaste primero extract_features.py?")
        return

    print("Cargando el dataset de características...")
    df = pd.read_csv(csv_path)
    
    # Separamos las características (X) de las etiquetas (y)
    # Eliminamos las columnas 'label' y 'file_name' de X porque no son características del sonido
    feature_cols = [col for col in df.columns if col.startswith('mfcc_')]
    X = df[feature_cols]
    y = df['label']
    
    print(f"Forma de la matriz de características (muestras, variables): {X.shape}")
    
    # Dividimos los datos: 80% para entrenar y 20% para evaluar (test)
    # stratify=y asegura que la proporción de clases se mantenga igual en ambos bloques
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("\nIniciando entrenamiento del modelo Random Forest...")
    # Inicializamos el clasificador
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    print("¡Entrenamiento completado!")
    
    # Realizamos predicciones sobre el conjunto de prueba para evaluar el rendimiento
    y_pred = model.predict(X_test)
    
    # Calculamos métricas de evaluación de rendimiento
    accuracy = accuracy_score(y_test, y_pred)
    print("\n================ MÉTRICAS DE RENDIMIENTO ================")
    print(f"Precisión General (Accuracy): {accuracy:.2%}")
    print("\nReporte de Clasificación Completo:")
    # 0 = Normal, 1 = Anómalo
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Anómalo']))
    
    print("Matriz de Confusión:")
    print(confusion_matrix(y_test, y_pred))
    print("=========================================================")
    
    # Creamos el directorio de salida si no existe (por ejemplo, una carpeta models/)
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    # Exportamos el modelo entrenado
    joblib.dump(model, model_output_path)
    print(f"\nModelo exportado exitosamente en: {model_output_path}")

if __name__ == "__main__":
    # Definimos rutas absolutas relativas a este archivo de script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CSV_FEATURES_PATH = os.path.join(BASE_DIR, '..', 'data', 'heartbeat_features.csv')
    MODEL_OUTPUT_PATH = os.path.join(BASE_DIR, '..', 'models', 'heartbeat_classifier.joblib')
    
    train_heartbeat_model(CSV_FEATURES_PATH, MODEL_OUTPUT_PATH)