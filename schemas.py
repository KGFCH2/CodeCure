"""
CodeCure - Pydantic Schemas
Request/Response models for API endpoints.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class PredictionRequest(BaseModel):
    """Request model for diabetes prediction."""
    pregnancies: int = Field(0, ge=0, le=20, description="Number of pregnancies")
    glucose: float = Field(..., ge=0, le=300, description="Plasma glucose concentration (mg/dL)")
    blood_pressure: float = Field(70, ge=0, le=200, description="Diastolic blood pressure (mm Hg)")
    skin_thickness: float = Field(20, ge=0, le=100, description="Triceps skin fold thickness (mm)")
    insulin: float = Field(80, ge=0, le=900, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(..., ge=10, le=70, description="Body Mass Index (weight in kg/(height in m)^2)")
    diabetes_pedigree: float = Field(0.47, ge=0, le=3, description="Diabetes pedigree function")
    age: int = Field(..., ge=1, le=120, description="Age in years")
    
    # Optional personal info
    name: Optional[str] = None
    email: Optional[str] = None
    device_id: Optional[str] = None
    gender: Optional[str] = None
    
    # Optional lifestyle
    exercise_hours: Optional[float] = 0
    sleep_hours: Optional[float] = 7
    smoking: Optional[bool] = False


class RiskFactor(BaseModel):
    """Individual risk factor explanation."""
    factor: str
    value: float
    status: str  # normal, warning, danger
    message: str
    impact: float  # contribution to risk


class PredictionResponse(BaseModel):
    """Response model for diabetes prediction."""
    # Patient info
    name: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    
    # Metrics (echo back to frontend for immediate display)
    glucose: Optional[float] = None
    blood_pressure: Optional[float] = None
    insulin: Optional[float] = None
    bmi: Optional[float] = None
    
    # Prediction results
    diabetes_risk: int  # 0 or 1
    risk_probability: float  # 0.0 - 1.0
    risk_level: str  # Low, Medium, High, Critical
    health_score: float  # 0 - 100
    risk_factors: List[RiskFactor]
    recommendations: List[str]
    summary: str


class PatientRecord(BaseModel):
    """Patient record response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: Optional[str] = None
    email: Optional[str] = None
    age: int
    gender: Optional[str] = None
    
    # Health metrics - all optional with sensible defaults for compatibility
    pregnancies: int = 0
    glucose: float = 0
    blood_pressure: Optional[float] = None
    skin_thickness: Optional[float] = None
    insulin: Optional[float] = None
    bmi: float = 0
    diabetes_pedigree: Optional[float] = None
    
    # Lifestyle
    exercise_hours: Optional[float] = 0
    sleep_hours: Optional[float] = 7
    smoking: Optional[bool] = False
    
    # Prediction results
    diabetes_risk: Optional[int] = None
    risk_probability: Optional[float] = None
    health_score: Optional[float] = None
    risk_level: Optional[str] = None
    summary: Optional[str] = Field(None, alias="explanation")
    created_at: datetime


class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_patients: int
    high_risk_count: int
    low_risk_count: int
    avg_health_score: float
    avg_glucose: float
    avg_bmi: float
    recent_predictions: List[PatientRecord]
