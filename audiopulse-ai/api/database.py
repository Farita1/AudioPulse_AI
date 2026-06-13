import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# El engine es el puente físico a la base de datos
engine = create_engine(DATABASE_URL)

# Cada objeto SessionLocal será una sesión de trabajo con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base de la cual heredarán nuestros modelos de tablas
Base = declarative_base()

def get_db():
    """ Dependencia para abrir y cerrar la sesión de la BD por cada petición HTTP """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()