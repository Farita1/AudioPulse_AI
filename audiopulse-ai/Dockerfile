# Usamos una imagen oficial de Python ligera basada en Debian
FROM python:3.13-slim

# Evita que Python escriba archivos .pyc en el disco y asegura que los logs salgan directo
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar librerías de audio y librosa
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo de dependencias primero para aprovechar la caché de capas de Docker
COPY requirements.txt .

# Instalamos las dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend al contenedor
COPY . .

# Exponemos el puerto en el que corre FastAPI
EXPOSE 8000

# Comando para arrancar la API con Uvicorn apuntando a la ruta del módulo
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]