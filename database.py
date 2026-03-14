"""
CodeCure - Database Models & Configuration
SQLAlchemy ORM models for patient records and predictions.
"""

from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./codecure.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Patient(Base):
    """Patient record model."""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=True)
    
    # Health metrics
    pregnancies = Column(Integer, default=0)
    glucose = Column(Float, nullable=False)
    blood_pressure = Column(Float, nullable=True)
    skin_thickness = Column(Float, nullable=True)
    insulin = Column(Float, nullable=True)
    bmi = Column(Float, nullable=False)
    diabetes_pedigree = Column(Float, nullable=True)
    
    # Lifestyle
    exercise_hours = Column(Float, default=0)
    sleep_hours = Column(Float, default=7)
    smoking = Column(Boolean, default=False)
    
    # Prediction results
    diabetes_risk = Column(Integer, nullable=True)  # 0 or 1
    risk_probability = Column(Float, nullable=True)  # 0.0 - 1.0
    health_score = Column(Float, nullable=True)  # 0 - 100
    risk_level = Column(String(20), nullable=True)  # Low, Medium, High, Critical
    
    # AI Explanation
    explanation = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PredictionLog(Base):
    """Log of all predictions made."""
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, nullable=True)
    
    # Input features
    pregnancies = Column(Integer)
    glucose = Column(Float)
    blood_pressure = Column(Float)
    skin_thickness = Column(Float)
    insulin = Column(Float)
    bmi = Column(Float)
    diabetes_pedigree = Column(Float)
    age = Column(Integer)
    
    # Results
    prediction = Column(Integer)
    probability = Column(Float)
    health_score = Column(Float)
    risk_level = Column(String(20))
    
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
