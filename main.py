"""
CodeCure - AI Health-Tech Platform
Main FastAPI Application

Endpoints:
  GET  /              → Serves the main web app
  POST /api/predict   → AI diabetes prediction
  GET  /api/dashboard → Dashboard statistics
  GET  /api/patients  → List all patients
  GET  /api/health    → Health check
"""

import os
import numpy as np
import joblib
from datetime import datetime
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel
from groq import Groq

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from database import get_db, Patient, PredictionLog, Base, engine
from schemas import (
    PredictionRequest, PredictionResponse, RiskFactor,
    PatientRecord, DashboardStats
)

# Load environment variables
load_dotenv()

# ──────────────────────────────────────────────
# App Configuration
# ──────────────────────────────────────────────
app = FastAPI(
    title="CodeCure - AI Health-Tech Platform",
    description="AI-driven health-tech solution for diabetes risk prediction and health management",
    version="1.0.0",
)

# Add CORS middleware for frontend access
# Since we're deploying as a single app on Render, we only really need local access,
# but keeping CORS for flexibility if needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for simplicity in single-host deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# ──────────────────────────────────────────────
# Load AI Models
# ──────────────────────────────────────────────
MODEL_DIR = "model"

try:
    model = joblib.load(os.path.join(MODEL_DIR, "diabetes_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
    feature_names = joblib.load(os.path.join(MODEL_DIR, "feature_names.pkl"))
    print("[OK] AI Model loaded successfully!")
except Exception as e:
    print(f"[ERROR] AI Model failed to load from {os.path.abspath(MODEL_DIR)}: {e}")
    model = None
    scaler = None
    feature_names = None


# ──────────────────────────────────────────────
# AI Analysis Functions
# ──────────────────────────────────────────────
def calculate_health_score(data: PredictionRequest, risk_prob: float) -> float:
    """
    Calculate AI Health Score (0-100) — like a CIBIL score but for health.
    Higher = healthier.
    """
    score = 100.0

    # Glucose penalty (normal: 70-100 fasting)
    if data.glucose > 140:
        score -= 20
    elif data.glucose > 126:
        score -= 15
    elif data.glucose > 100:
        score -= 8

    # BMI penalty (normal: 18.5-24.9)
    if data.bmi > 35:
        score -= 20
    elif data.bmi > 30:
        score -= 15
    elif data.bmi > 25:
        score -= 8
    elif data.bmi < 18.5:
        score -= 5

    # Blood pressure penalty (normal: <80 diastolic)
    if data.blood_pressure > 90:
        score -= 15
    elif data.blood_pressure > 80:
        score -= 8

    # Age factor
    if data.age > 60:
        score -= 10
    elif data.age > 45:
        score -= 5

    # Lifestyle bonuses
    if data.exercise_hours and data.exercise_hours >= 3:
        score += 5
    if data.sleep_hours and 7 <= data.sleep_hours <= 9:
        score += 3
    if data.smoking:
        score -= 10

    # AI risk adjustment
    score -= risk_prob * 20

    return max(0, min(100, round(score, 1)))


def analyze_risk_factors(data: PredictionRequest) -> List[RiskFactor]:
    """Generate explainable AI risk factor analysis."""
    factors = []

    # Glucose analysis
    if data.glucose > 140:
        factors.append(RiskFactor(
            factor="Glucose Level",
            value=data.glucose,
            status="danger",
            message=f"Your fasting glucose ({data.glucose} mg/dL) is significantly high. Normal range is 70-100 mg/dL.",
            impact=0.35
        ))
    elif data.glucose > 126:
        factors.append(RiskFactor(
            factor="Glucose Level",
            value=data.glucose,
            status="danger",
            message=f"Your glucose ({data.glucose} mg/dL) indicates diabetic range (>126 mg/dL).",
            impact=0.30
        ))
    elif data.glucose > 100:
        factors.append(RiskFactor(
            factor="Glucose Level",
            value=data.glucose,
            status="warning",
            message=f"Your glucose ({data.glucose} mg/dL) is in the pre-diabetic range (100-125 mg/dL).",
            impact=0.15
        ))
    else:
        factors.append(RiskFactor(
            factor="Glucose Level",
            value=data.glucose,
            status="normal",
            message=f"Your glucose ({data.glucose} mg/dL) is within normal range.",
            impact=0.0
        ))

    # BMI analysis
    if data.bmi > 35:
        factors.append(RiskFactor(
            factor="Body Mass Index",
            value=data.bmi,
            status="danger",
            message=f"BMI of {data.bmi} indicates Class II Obesity. Target: 18.5-24.9.",
            impact=0.30
        ))
    elif data.bmi > 30:
        factors.append(RiskFactor(
            factor="Body Mass Index",
            value=data.bmi,
            status="danger",
            message=f"BMI of {data.bmi} indicates Obesity. This significantly increases diabetes risk.",
            impact=0.25
        ))
    elif data.bmi > 25:
        factors.append(RiskFactor(
            factor="Body Mass Index",
            value=data.bmi,
            status="warning",
            message=f"BMI of {data.bmi} indicates overweight. Consider weight management.",
            impact=0.15
        ))
    else:
        factors.append(RiskFactor(
            factor="Body Mass Index",
            value=data.bmi,
            status="normal",
            message=f"BMI of {data.bmi} is within healthy range.",
            impact=0.0
        ))

    # Blood pressure analysis
    if data.blood_pressure > 90:
        factors.append(RiskFactor(
            factor="Blood Pressure",
            value=data.blood_pressure,
            status="danger",
            message=f"Diastolic BP of {data.blood_pressure} mmHg indicates hypertension.",
            impact=0.20
        ))
    elif data.blood_pressure > 80:
        factors.append(RiskFactor(
            factor="Blood Pressure",
            value=data.blood_pressure,
            status="warning",
            message=f"Diastolic BP of {data.blood_pressure} mmHg is elevated.",
            impact=0.10
        ))
    else:
        factors.append(RiskFactor(
            factor="Blood Pressure",
            value=data.blood_pressure,
            status="normal",
            message=f"Blood pressure ({data.blood_pressure} mmHg) is normal.",
            impact=0.0
        ))

    # Age analysis
    if data.age > 60:
        factors.append(RiskFactor(
            factor="Age Factor",
            value=float(data.age),
            status="warning",
            message=f"Age {data.age} increases risk. Regular screening is recommended.",
            impact=0.15
        ))
    elif data.age > 45:
        factors.append(RiskFactor(
            factor="Age Factor",
            value=float(data.age),
            status="warning",
            message=f"Age {data.age} — diabetes risk increases after 45.",
            impact=0.10
        ))
    else:
        factors.append(RiskFactor(
            factor="Age Factor",
            value=float(data.age),
            status="normal",
            message=f"Age {data.age} — lower age-related risk.",
            impact=0.0
        ))

    # Insulin analysis
    if data.insulin > 166:
        factors.append(RiskFactor(
            factor="Insulin Level",
            value=data.insulin,
            status="danger",
            message=f"Insulin level ({data.insulin} mu U/ml) is elevated. Normal: 16-166 mu U/ml.",
            impact=0.15
        ))
    elif data.insulin > 0:
        factors.append(RiskFactor(
            factor="Insulin Level",
            value=data.insulin,
            status="normal",
            message=f"Insulin level ({data.insulin} mu U/ml) is within normal range.",
            impact=0.0
        ))

    return factors


def generate_recommendations(data: PredictionRequest, risk_level: str) -> List[str]:
    """Generate personalized health recommendations."""
    recs = []

    if data.glucose > 100:
        recs.append("🍎 Monitor blood sugar regularly. Reduce refined carbohydrate and sugar intake.")
    if data.bmi > 25:
        recs.append("🏃 Aim for 150 minutes of moderate aerobic activity per week to manage weight.")
    if data.blood_pressure > 80:
        recs.append("🧂 Reduce sodium intake and practice stress management for blood pressure control.")
    if data.exercise_hours and data.exercise_hours < 3:
        recs.append("💪 Increase physical activity. Even 30 minutes of walking daily can significantly reduce risk.")
    if data.sleep_hours and (data.sleep_hours < 7 or data.sleep_hours > 9):
        recs.append("😴 Aim for 7-9 hours of quality sleep. Poor sleep affects insulin sensitivity.")
    if data.smoking:
        recs.append("🚭 Smoking significantly increases diabetes complications. Consider a cessation program.")

    if risk_level in ["High", "Critical"]:
        recs.append("🏥 Schedule an appointment with your healthcare provider for comprehensive evaluation.")
        recs.append("📋 Consider an HbA1c test for long-term glucose monitoring.")
    
    if not recs:
        recs.append("✅ Great job! Maintain your healthy lifestyle with balanced diet and regular exercise.")
        recs.append("📅 Continue with annual health check-ups for preventive care.")

    return recs


def get_risk_level(probability: float) -> str:
    """Determine risk level from probability."""
    if probability >= 0.75:
        return "Critical"
    elif probability >= 0.50:
        return "High"
    elif probability >= 0.30:
        return "Medium"
    else:
        return "Low"


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve the main application page."""
    try:
        groq_api_key = os.getenv("GROQ_API_KEY", "")
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        return templates.TemplateResponse("index.html", {
            "request": request,
            "groq_api_key": groq_api_key,
            "backend_url": backend_url
        })
    except Exception as e:
        # Fallback error page
        return HTMLResponse(f"""
        <html>
        <head><title>CodeCure - Error</title></head>
        <body>
        <h1>Application Error</h1>
        <p>There was an issue loading the application: {str(e)}</p>
        <p>Please check the <a href="/api/health">health check</a> for more details.</p>
        </body>
        </html>
        """, status_code=500)


@app.get("/api/health")
async def health_check():
    """API health check endpoint."""
    import os

    # Check environment
    groq_key_set = bool(os.getenv("GROQ_API_KEY"))
    vercel_env = bool(os.getenv("VERCEL"))

    # Check database
    db_status = "unknown"
    try:
        # Try to create tables
        Base.metadata.create_all(bind=engine)
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Check static files
    static_exists = os.path.exists("static")
    templates_exist = os.path.exists("templates")

    return {
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None,
        "database_status": db_status,
        "groq_api_key_set": groq_key_set,
        "vercel_environment": vercel_env,
        "static_files_exist": static_exists,
        "templates_exist": templates_exist,
        "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
        "working_directory": os.getcwd(),
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/predict", response_model=PredictionResponse)
async def predict_diabetes(data: PredictionRequest, db: Session = Depends(get_db)):
    """
    AI Diabetes Risk Prediction Endpoint.
    
    Accepts patient health metrics and returns:
    - Risk prediction (0/1)
    - Risk probability (0-1)
    - AI Health Score (0-100)
    - Explainable risk factors
    - Personalized recommendations
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI Model not loaded. Please run 'python train_model.py' first."
        )

    # Prepare input features
    input_features = np.array([[
        data.pregnancies,
        data.glucose,
        data.blood_pressure,
        data.skin_thickness,
        data.insulin,
        data.bmi,
        data.diabetes_pedigree,
        data.age
    ]])

    # Scale and predict
    input_scaled = scaler.transform(input_features)
    prediction = model.predict(input_scaled)[0]
    
    # Get probability
    if hasattr(model, 'predict_proba'):
        probability = model.predict_proba(input_scaled)[0][1]
    else:
        probability = float(prediction)

    # Get risk level
    risk_level = get_risk_level(probability)

    # Calculate AI Health Score
    health_score = calculate_health_score(data, probability)

    # Analyze risk factors (Explainable AI)
    risk_factors = analyze_risk_factors(data)

    # Generate recommendations
    recommendations = generate_recommendations(data, risk_level)

    # Generate summary
    if risk_level == "Critical":
        summary = f"⚠️ CRITICAL RISK: Your diabetes risk probability is {probability*100:.1f}%. Immediate medical consultation is strongly recommended."
    elif risk_level == "High":
        summary = f"🔴 HIGH RISK: Your analysis shows a {probability*100:.1f}% probability of diabetes. Please consult a healthcare provider soon."
    elif risk_level == "Medium":
        summary = f"🟡 MODERATE RISK: You have a {probability*100:.1f}% diabetes risk. Lifestyle changes are recommended."
    else:
        summary = f"🟢 LOW RISK: Your diabetes risk is {probability*100:.1f}%. Keep maintaining your healthy lifestyle!"

    # Save to database
    patient = Patient(
        name=data.name,
        email=data.email,
        device_id=data.device_id,
        age=data.age,
        gender=data.gender,
        pregnancies=data.pregnancies or 0,
        glucose=data.glucose,
        blood_pressure=data.blood_pressure or 72,  # Default diastolic
        skin_thickness=data.skin_thickness or 20,
        insulin=data.insulin or 80,
        bmi=data.bmi,
        diabetes_pedigree=data.diabetes_pedigree or 0.47,
        exercise_hours=data.exercise_hours or 0,
        sleep_hours=data.sleep_hours or 7,
        smoking=data.smoking or False,
        diabetes_risk=int(prediction),
        risk_probability=round(probability, 4),
        health_score=health_score,
        risk_level=risk_level,
        explanation=summary
    )
    db.add(patient)

    # Log prediction
    log = PredictionLog(
        pregnancies=data.pregnancies,
        glucose=data.glucose,
        blood_pressure=data.blood_pressure,
        skin_thickness=data.skin_thickness,
        insulin=data.insulin,
        bmi=data.bmi,
        diabetes_pedigree=data.diabetes_pedigree,
        age=data.age,
        prediction=int(prediction),
        probability=round(probability, 4),
        health_score=health_score,
        risk_level=risk_level,
        device_id=data.device_id
    )
    db.add(log)
    db.commit()

    return PredictionResponse(
        name=data.name,
        email=data.email,
        gender=data.gender,
        age=data.age,
        glucose=data.glucose,
        blood_pressure=data.blood_pressure,
        insulin=data.insulin,
        bmi=data.bmi,
        diabetes_risk=int(prediction),
        risk_probability=round(probability, 4),
        risk_level=risk_level,
        health_score=health_score,
        risk_factors=risk_factors,
        recommendations=recommendations,
        summary=summary
    )


@app.get("/api/dashboard", response_model=DashboardStats)
async def get_dashboard(
    device_id: str | None = None,
    db: Session = Depends(get_db)
):
    """Get dashboard statistics."""
    query = db.query(Patient)
    if device_id:
        query = query.filter(Patient.device_id == device_id)

    total = query.count()
    
    if total == 0:
        return DashboardStats(
            total_patients=0,
            high_risk_count=0,
            low_risk_count=0,
            avg_health_score=0,
            avg_glucose=0,
            avg_bmi=0,
            recent_predictions=[]
        )

    high_risk = query.filter(Patient.risk_level.in_(["High", "Critical"])).count()
    low_risk = total - high_risk
    
    avg_health = query.with_entities(func.avg(Patient.health_score)).scalar() or 0
    avg_glucose = query.with_entities(func.avg(Patient.glucose)).scalar() or 0
    avg_bmi = query.with_entities(func.avg(Patient.bmi)).scalar() or 0

    recent = query.order_by(Patient.created_at.desc()).limit(10).all()

    # Log fields to verify they are being fetched
    if recent:
        p = recent[0]
        print(f"[DASHBOARD] First record: ID={p.id}, Glucose={p.glucose}, BP={p.blood_pressure}, Insulin={p.insulin}")

    recent_records = []
    for p in recent:
        try:
            record = PatientRecord.model_validate(p)
            recent_records.append(record)
        except Exception as e:
            print(f"[DASHBOARD] Error validating patient {p.id}: {str(e)}")

    return DashboardStats(
        total_patients=total,
        high_risk_count=high_risk,
        low_risk_count=low_risk,
        avg_health_score=round(avg_health, 1),
        avg_glucose=round(avg_glucose, 1),
        avg_bmi=round(avg_bmi, 1),
        recent_predictions=recent_records
    )


@app.get("/api/patients")
async def get_patients(db: Session = Depends(get_db)):
    """Get all patients."""
    patients = db.query(Patient).order_by(Patient.created_at.desc()).all()
    records = []
    for p in patients:
        try:
            records.append(PatientRecord.model_validate(p))
        except Exception as e:
            print(f"[PATIENTS] Error validating patient {p.id}: {str(e)}")
    return records


# ──────────────────────────────────────────────
# List Available GROQ Models
# ──────────────────────────────────────────────
@app.get("/api/groq-models")
async def groq_list_models():
    """
    List all available GROQ models with your API key.
    """
    try:
        groq_api_key = os.getenv("GROQ_API_KEY", "")
        
        if not groq_api_key:
            return JSONResponse({
                "status": "❌ FAILED",
                "error": "GROQ_API_KEY is not configured"
            }, status_code=500)
        
        print("[GROQ MODELS] Fetching available models...")
        
        import requests
        response = requests.get(
            "https://api.groq.com/openai/v1/models",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            models = [model.get("id") for model in data.get("data", [])]
            return JSONResponse({
                "status": "✅ SUCCESS",
                "available_models": models,
                "total": len(models)
            }, status_code=200)
        else:
            return JSONResponse({
                "status": "❌ FAILED",
                "error": f"GROQ API returned status {response.status_code}",
                "details": response.text[:200]
            }, status_code=response.status_code)
    
    except Exception as e:
        return JSONResponse({
            "status": "❌ ERROR",
            "error": str(e)
        }, status_code=500)


# ──────────────────────────────────────────────
# AI Chatbot Test Endpoint (GROQ API Health Check)
# ──────────────────────────────────────────────
@app.get("/api/groq-test")
async def groq_test():
    """
    Test if GROQ API key is working and configured correctly.
    """
    try:
        groq_api_key = os.getenv("GROQ_API_KEY", "")
        
        if not groq_api_key:
            return JSONResponse({
                "status": "❌ FAILED",
                "error": "GROQ_API_KEY is not configured",
                "details": "Set GROQ_API_KEY in .env file"
            }, status_code=500)
        
        print("[GROQ TEST] Testing GROQ API connection...")
        
        groq_client = Groq(api_key=groq_api_key)
        
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "user", "content": "Say 'GROQ API is working!'"}
                ],
                max_tokens=50,
                temperature=0.7
            )
            
            message = completion.choices[0].message.content
            print(f"[GROQ TEST] Response: {message}")
            
            return JSONResponse({
                "status": "✅ SUCCESS",
                "message": "GROQ API is working perfectly!",
                "test_response": message,
                "model": "llama-3.1-8b-instant"
            }, status_code=200)
        
        except Exception as e:
            print(f"[GROQ TEST] Error: {str(e)}")
            return JSONResponse({
                "status": "❌ FAILED",
                "error": str(e),
                "details": str(e)
            }, status_code=500)
    
    except Exception as e:
        return JSONResponse({
            "status": "❌ ERROR",
            "error": str(e)
        }, status_code=500)


# ──────────────────────────────────────────────
# AI Chatbot Endpoint (GROQ API)
# ──────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str


def build_precise_chat_response(query: str):
    normalized_query = query.lower().strip()

    if any(phrase in normalized_query for phrase in ["current year", "what year is it", "year now"]):
        return f"**The current year is {datetime.now().year}.**"

    if any(phrase in normalized_query for phrase in ["current date", "today's date", "what is the date", "date today"]):
        current_date = datetime.now().strftime("%B %d, %Y").replace(" 0", " ")
        return f"**The current date is {current_date}.**"

    if any(phrase in normalized_query for phrase in ["current temperature", "current temparature", "temperature now", "weather"]) and "codecure" not in normalized_query:
        return "*I do not have real-time weather or temperature access.* Please check a weather app or website for the current temperature."

    if any(phrase in normalized_query for phrase in ["how to calculate all the metrics", "calculate all the metrics", "metrics used here", "how do i calculate the metrics"]):
        return (
            "**CodeCure uses these 8 metrics:**\n"
            "1. **Glucose Level** - measure blood sugar with a glucometer or blood test.\n"
            "2. **Blood Pressure** - measure with a blood pressure monitor.\n"
            "3. **BMI** - calculate as weight in kg divided by height in meters squared.\n"
            "4. **Insulin Level** - measure with a blood test.\n"
            "5. **Skin Thickness** - measure with a skin caliper or clinic test.\n"
            "6. **Diabetes Pedigree Function** - use family history of diabetes.\n"
            "7. **Age** - record your age in years.\n"
            "8. **Pregnancy History** - record the number of pregnancies."
        )

    return None

@app.post("/api/chat")
async def chat(chat_data: ChatRequest):
    """
    AI Chatbot endpoint using GROQ API.
    Proxies requests to GROQ to avoid CORS issues.
    """
    try:
        query = chat_data.query.strip()
        
        if not query:
            return JSONResponse({"error": "Query cannot be empty"}, status_code=400)

        precise_response = build_precise_chat_response(query)
        if precise_response:
            return JSONResponse({
                "success": True,
                "response": precise_response,
                "source": "rules"
            })
        
        groq_api_key = os.getenv("GROQ_API_KEY", "")
        
        if not groq_api_key:
            return JSONResponse(
                {"error": "GROQ_API_KEY not configured on server"},
                status_code=500
            )
        
        # System prompt for CodeCure assistant with formatting instructions
        system_prompt = """You are CodeCure's AI Assistant.

    Answer rules:
    - Give the direct answer first in one short sentence.
    - Keep responses precise, clear, and easy to understand.
    - Use short bullet points only when they improve clarity.
    - Avoid long introductions, repeated wording, and filler.
    - Never cut off mid-thought; finish the full answer.
    - If a question is about CodeCure, mention the platform and the creators Babin Bid and Debasmita Bose when relevant.
    - If the user asks for steps or a list, use a numbered list with brief items.
    - If the user asks about health, include a short safety note that this is informational and not a diagnosis.
    - Format answers in markdown when helpful.
    - Use **bold** for important terms, *italics* for emphasis, and [links](https://example.com) for URLs.
    - Keep markdown simple and readable.

    CodeCure facts:
    - CodeCure predicts diabetes risk using 8 metrics: Glucose Level, Blood Pressure, BMI, Insulin Level, Skin Thickness, Diabetes Pedigree Function, Age, and Pregnancy History.
    - It provides a diabetes risk probability and an AI Health Score from 0 to 100.
    - The platform is deployed at https://code-cure.vercel.app/.

    Use plain language and make every answer complete, but no longer than needed."""

        # Call GROQ API
        # Call GROQ API using Groq SDK
        groq_client = Groq(api_key=groq_api_key)
        print(f"[GROQ] Calling GROQ API with model: llama-3.1-8b-instant")
        print(f"[GROQ] Query: {query[:100]}...")
        
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                max_tokens=768,
                temperature=0.3
            )
            
            message = completion.choices[0].message.content
            print(f"[GROQ] ✅ Success! Got response from GROQ")
            
            return JSONResponse({
                "success": True,
                "response": message.strip(),
                "source": "groq"
            })
        
        except Exception as groq_error:
            print(f"[GROQ] ❌ Error: {str(groq_error)}")
            return JSONResponse({
                "success": False,
                "error": str(groq_error),
                "details": str(groq_error)
            }, status_code=500)
    
    except Exception as e:
        return JSONResponse(
            {"error": str(e)},
            status_code=500
        )


# ──────────────────────────────────────────────
# Startup
# ──────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    Base.metadata.create_all(bind=engine)

    # Ensure the database schema includes new columns (for upgrades)
    with engine.connect() as conn:
        for table, col, col_type in [
            ("patients", "device_id", "TEXT"),
            ("prediction_logs", "device_id", "TEXT"),
        ]:
            cols = [row[1] for row in conn.execute(text(f"PRAGMA table_info({table})")).fetchall()]
            if col not in cols:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))

    print("[START] CodeCure AI Platform Ready (Vercel Mode: {})".format(bool(os.environ.get('VERCEL'))))
