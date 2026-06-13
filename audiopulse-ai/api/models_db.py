from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class PacienteScreening(Base):
    __tablename__ = "paciente_screenings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cedula_paciente = Column(String(20), index=True, nullable=False)
    nombre_paciente = Column(String(100), nullable=False)
    edad_paciente = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    diagnosis = Column(String(50), nullable=False)  # "Normal" o "Anómalo"
    probability = Column(Float, nullable=False)      # Porcentaje de certeza (0.88)
    s3_url = Column(String(500), nullable=False)     # Enlace público de AWS S3
    created_at = Column(DateTime, default=datetime.utcnow)