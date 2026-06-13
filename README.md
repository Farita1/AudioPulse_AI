# AudioPulse AI — Plataforma de Inteligencia Acústica Cardiovascular

AudioPulse AI es un sistema Full-Stack de salud digital diseñado para el tamizaje algorítmico automatizado de señales acústicas cardíacas mediante fonocardiogramas (PCG). El sistema es capaz de procesar señales de audio capturadas por estetoscopios digitales, extraer sus componentes de frecuencia fundamentales, clasificar la condición biológica en tiempo real y persistir los registros médicos de forma segura en la nube.

---

## 📁 Arquitectura del Monorepo

El proyecto está estructurado bajo una arquitectura desacoplada y contenerizada para garantizar escalabilidad, mantenibilidad y un despliegue independiente:

* **`audiopulse-ai/` (Backend & AI):** * **Core:** Desarrollado en Python utilizando el framework asíncrono **FastAPI** bajo el servidor ASGI **Uvicorn**.
    * **DSP (Procesamiento Digital de Señales):** Implementa pipelines con la librería **Librosa** para la extracción de coeficientes cepstrales en las frecuencias de Mel (MFCCs) a partir de bytes de audio nativos en memoria (`io.BytesIO`).
    * **Inferencia de ML:** Integra un modelo de clasificación binaria basado en **Random Forest** entrenado con Scikit-Learn y serializado con Joblib.
    * **Cloud Storage & Persistencia:** Conexión directa y asíncrona mediante el SDK **Boto3** para el almacenamiento automatizado de archivos `.wav` de auditoría médica en buckets de **AWS S3**, y persistencia de metadatos clínicos en **PostgreSQL** mediante **SQLAlchemy**.
* **`audiopulse-ui/` (Frontend):**
    * **Core:** Construido sobre **React 18+** utilizando el empaquetador de alto rendimiento **Vite**.
    * **Diseño:** Interfaz adaptativa, minimalista y de estándar médico diseñada con **Tailwind CSS v4** utilizando la compilación nativa por medio de `@tailwindcss/vite`.
    * **Interactividad:** Implementa zonas dinámicas de *Drag and Drop* para el procesamiento de archivos de audio biométricos y renderizado reactivo de certezas estadísticas y enlaces de descarga en la nube.

---

## 🛠️ Tecnologías y Herramientas Utilizadas

### Backend e Inteligencia Artificial
* **Python 3.13**
* **FastAPI** & **Uvicorn**
* **SQLAlchemy** & **Psycopg2** (ORMs y Drivers relacionales)
* **Librosa** (Procesamiento de Señales de Audio)
* **Scikit-Learn** (Algoritmo Random Forest)
* **Boto3** (AWS SDK para S3)
* **Joblib** & **Pandas**

### Frontend y UI/UX
* **React 18+**
* **Vite**
* **Tailwind CSS v4** (Arquitectura basada en componentes y variables CSS `@theme`)

### Infraestructura, Base de Datos y Control
* **PostgreSQL 15** (Motor de base de datos relacional)
* **pgAdmin 4** (Panel web de administración de base de datos)
* **AWS S3** (Amazon Simple Storage Service)
* **Docker & Docker Compose** (Contenerización de toda la pila tecnológica)
* **Git / GitHub** (Gestión de Monorepo centralizado)

---

## 🚀 Instrucciones para Ejecución Local (Docker Compose)

La forma más rápida y recomendada para levantar el ecosistema completo (Frontend, Backend, Base de Datos y pgAdmin) de manera integrada es utilizando Docker.

### 1. Clonar el repositorio e ingresar al directorio principal
```bash
git clone [https://github.com/Farita1/proyectos.git](https://github.com/Farita1/proyectos.git)
cd proyectos

2. Configurar variables de entorno
Antes de levantar los contenedores, asegúrate de crear y configurar los archivos .env necesarios tanto en la raíz como en las carpetas específicas para enlazar tus llaves de AWS S3 (Access Key, Secret Key, Región y Bucket Name) y las credenciales de PostgreSQL.

3. Levantar la plataforma completa
Ejecuta el siguiente comando en tu terminal para compilar las imágenes e iniciar los servicios en segundo plano:

Bash
docker-compose up --build -d
4. Puertos y Acceso Local
Una vez levantado el ecosistema, podrás acceder a las siguientes plataformas:

Frontend UI (React + Vite): http://localhost:5173

Backend API Docs (FastAPI/Swagger): http://localhost:8000/docs

Panel de Base de Datos (pgAdmin): http://localhost:5050

🛠️ Ejecución Local para Desarrollo Tradicional (Sin Docker)
Si prefieres realizar modificaciones en caliente directamente sobre tu máquina local:

Levantando el Backend (audiopulse-ai)
Bash
cd audiopulse-ai
python -m venv entorno

# En Windows (PowerShell):
.\entorno\Scripts\activate

# En Linux/macOS:
source entorno/bin/activate

pip install -r requirements.txt
uvicorn api.main:app --reload
Levantando el Frontend (audiopulse-ui)
Abre una nueva pestaña en tu terminal y ejecuta:

Bash
cd audiopulse-ui
npm install
npm run dev
Developed by Juan David Perez Villalobos — Systems Engineering Student & Junior Backend Developer.


---

## 🔄 Subir la documentación a tu GitHub

Una vez que actualices el archivo `README.md` en la raíz de tu proyecto local, ejecuta estos tres comandos en tu consola de PowerShell para subir los cambios a tu repositorio remoto de inmediato:

```bash
git add README.md
git commit -m "docs: actualizar README con arquitectura monorepo, docker-compose y especificaciones de IA"
git push origin main
