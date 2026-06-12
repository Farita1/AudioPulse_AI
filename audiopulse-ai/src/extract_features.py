import os
import glob
import librosa
import numpy as np
import pandas as pd

def extract_mfcc_features(file_path, n_mfcc=13):
    """
    Carga un archivo de audio, calcula sus MFCCs y obtiene el promedio
    de cada coeficiente a lo largo del tiempo para generar un vector fijo.
    """
    try:
        # CORRECCIÓN: Removemos resample_type porque ya no es soportado en librosa.load()
        # Librosa manejará de forma óptima el remuestreo por defecto si es necesario.
        audio, sample_rate = librosa.load(file_path, sr=None)
        
        # Extraemos los coeficientes MFCC
        mfccs = librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=n_mfcc)
        
        # Como el audio varía en duración, la matriz MFCC varía en ancho.
        # Sacamos el promedio a lo largo del tiempo (eje 1) para tener siempre n_mfcc columnas fijas.
        mfccs_processed = np.mean(mfccs.T, axis=0)
        
        return mfccs_processed
    except Exception as e:
        print(f"Error procesando el archivo {file_path}: {e}")
        return None

def build_dataset(base_dir):
    """
    Recorre las carpetas de datos, procesa los audios y construye un DataFrame de Pandas.
    """
    features_list = []
    
    # Mapeo de subcarpetas a etiquetas numéricas y de texto
    # 0 = Normal, 1 = Anómalo/Soplo
    categories = {
        'normales': 0,
        'anomalos': 1
    }
    
    print("Iniciando la extracción de características de audio...")
    
    for folder_name, label in categories.items():
        folder_path = os.path.join(base_dir, folder_name)
        # Buscamos todos los archivos .wav en la carpeta
        search_path = os.path.join(folder_path, '*.wav')
        audio_files = glob.glob(search_path)
        
        print(f"\nProcesando categoría '{folder_name}' - Encontrados {len(audio_files)} archivos.")
        
        for file_path in audio_files:
            mfccs = extract_mfcc_features(file_path)
            
            if mfccs is not None:
                # Creamos un diccionario con las características y la etiqueta
                row = {f'mfcc_{i+1}': val for i, val in enumerate(mfccs)}
                row['label'] = label
                row['file_name'] = os.path.basename(file_path)
                features_list.append(row)
                
    # Convertimos la lista de diccionarios en un DataFrame de Pandas
    df = pd.DataFrame(features_list)
    return df

if __name__ == "__main__":
    # Definimos la ruta base de los datos (subiendo un nivel desde src/)
    BASE_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    
    # Validamos que existan las carpetas necesarias
    if not os.path.exists(BASE_DATA_DIR):
        print(f"Error: No se encontró el directorio de datos en {BASE_DATA_DIR}")
        print("Asegúrate de crear las carpetas 'data/normales' y 'data/anomalos'")
    else:
        # Construimos el conjunto de datos numérico
        dataset_df = build_dataset(BASE_DATA_DIR)
        
        if not dataset_df.empty:
            # Guardamos el resultado en un archivo CSV dentro de la carpeta data/
            output_csv_path = os.path.join(BASE_DATA_DIR, 'heartbeat_features.csv')
            dataset_df.to_csv(output_csv_path, index=False)
            
            print("\n¡Procesamiento completado con éxito!")
            print(f"Dataset guardado en: {output_csv_path}")
            print(f"Total de registros procesados: {len(dataset_df)}")
            print("\nDistribución de clases:")
            print(dataset_df['label'].value_counts())
        else:
            print("No se pudieron extraer características de ningún archivo de audio.")