# AudioPulse AI — Analizador de Audio y Diagnóstico Cardíaco Asistido

AudioPulse AI es una plataforma web end-to-end de salud digital (*Digital Health*) diseñada para clasificar y analizar señales de audio biométricas provenientes de estetoscopios digitales. Utilizando técnicas avanzadas de Procesamiento de Señales Digitales (DSP) y Machine Learning, el sistema es capaz de preprocesar grabaciones de latidos del corazón e identificar patrones anómalos, tales como soplos cardíacos (*murmurs*), diferenciándolos de ritmos cardíacos normales.

Este proyecto demuestra la viabilidad de implementar sistemas inteligentes de tamizaje médico de primera línea, tanto para entornos hospitalarios como para el monitoreo remoto de pacientes mediante dispositivos móviles.

---

## 🚀 Características Clave

* **Procesamiento de Señales de Audio (DSP):** Extracción automatizada de Coeficientes Cepstrales en las Frecuencias de Mel (MFCCs) utilizando la librería `Librosa` para capturar la huella acústica de los fonocardiogramas.
* **Modelo Predictivo de Machine Learning:** Clasificador supervisado basado en el algoritmo *Random Forest*, optimizado para manejar datos acústicos con ruido ambiental real.
* **Arquitectura Modular e Independiente:** Pipeline de datos completamente separado de la lógica de entrenamiento, facilitando el mantenimiento y la escalabilidad del modelo.
* **Diseño Orientado a la Nube (Próximamente):** Arquitectura pensada para un almacenamiento seguro y escalable utilizando la capa gratuita de AWS S3 para las señales de audio, con un backend asíncrono en FastAPI y frontend interactivo en React.

---

## 📊 Arquitectura del Sistema

El flujo de datos del proyecto sigue un ciclo de vida limpio y desacoplado:

1. **Ingesta de Datos:** Recepción de archivos de audio crudos en formato `.wav`.
2. **Pipeline de DSP (Digital Signal Processing):** Remuestreo adaptativo y extracción de características matemáticas (MFCCs) promediadas en el tiempo.
3. **Inferencia / Clasificación:** El motor de Machine Learning procesa los vectores numéricos y calcula la probabilidad de presencia de anomalías estructurales en el latido.
4. **Entrega de Resultados:** Retorno de métricas precisas y predicciones estructuradas en formato JSON.

---

## 📁 Estructura del Proyecto

```text
audiopulse-ai/
├── data/
│   ├── normales/               # Muestras de audio de latidos cardíacos limpios
│   ├── anomalos/               # Muestras de audio con soplos cardíacos (Murmurs)
│   └── heartbeat_features.csv  # Dataset tabular generado tras la extracción de características
├── models/
│   └── heartbeat_classifier.joblib # Cerebro del modelo de ML serializado y entrenado
├── src/
│   ├── extract_features.py     # Script encargado del pipeline DSP (Audio -> MFCCs)
│   └── train.py                # Script de entrenamiento, validación y exportación de la IA
└── requirements.txt            # Dependencias del entorno de desarrollo