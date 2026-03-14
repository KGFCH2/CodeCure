# 🩺 CodeCure — AI Health-Tech Platform 🧬

> AI-driven health-tech solution for diabetes risk prediction, health scoring, and personalized medical insights powered by machine learning.

![Python](https://img.shields.io/badge/Python-3.14+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-green?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8+-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

## 🎯 Core Vision

CodeCure is an intelligent health-tech platform that:

- **Predicts** chronic disease risk using machine learning
- **Explains** AI decisions with transparent risk factor analysis  
- **Scores** overall health with an AI Health Score (0-100)
- **Recommends** personalized lifestyle changes
- **Stores** patient records for tracking and analytics

---

## ⚡ Features

| Feature | Description |
| ------- | ----------- |
| 🔮 **Diabetes Risk Prediction** | ML models predict diabetes risk from clinical metrics |
| 💯 **AI Health Score** | Single 0-100 index (like CIBIL for health) |
| 🔍 **Explainable AI (XAI)** | Every prediction shows exactly which factors contributed |
| 📋 **Personalized Recommendations** | AI-generated health advice based on your profile |
| 📊 **Analytics Dashboard** | Real-time stats, risk distribution, patient history |
| 🗄️ **Patient Database** | SQLite-powered record storage with full history |
| 🏥 **Clinical Metrics** | 8+ health parameters including glucose, BMI, BP, insulin |

---

## 🏗️ Architecture

```text
CodeCure/
├── main.py            # FastAPI application (routes + API)
├── train_model.py     # AI model training script
├── database.py        # SQLAlchemy ORM models
├── schemas.py         # Pydantic request/response schemas
├── requirements.txt   # Python dependencies
├── templates/
│   └── index.html     # Premium single-page web app
├── static/
│   └── style.css      # Design system (dark mode + glassmorphism)
└── model/
    ├── diabetes_model.pkl    # Trained ML model
    ├── scaler.pkl            # Feature scaler
    └── feature_names.pkl     # Feature names
```

### Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Backend** | FastAPI, Uvicorn |
| **AI/ML** | Scikit-learn (Logistic Regression, Random Forest, Gradient Boosting) |
| **Database** | SQLite + SQLAlchemy ORM |
| **Frontend** | HTML5, CSS3 (custom design system), Vanilla JS |
| **Data** | Pandas, NumPy |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+ installed
- VS Code (recommended)

### Setup

```bash
# 1. Navigate to project
cd CodeCure

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Train AI model
python train_model.py

# 6. Start the server
python -m uvicorn main:app --reload

# 7. Open in browser
# http://127.0.0.1:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/` | Main web application |
| `POST` | `/api/predict` | AI diabetes prediction |
| `GET` | `/api/dashboard` | Dashboard statistics |
| `GET` | `/api/patients` | List all patients |
| `GET` | `/api/health` | Health check |
| `GET` | `/docs` | Swagger API documentation |

### Example Prediction Request

```json
POST /api/predict
{
    "age": 45,
    "glucose": 148,
    "bmi": 33.6,
    "blood_pressure": 85,
    "pregnancies": 0,
    "skin_thickness": 20,
    "insulin": 80,
    "diabetes_pedigree": 0.47,
    "name": "John Doe",
    "exercise_hours": 2,
    "sleep_hours": 7,
    "smoking": false
}
```

### Example Response

```json
{
    "diabetes_risk": 1,
    "risk_probability": 0.47,
    "risk_level": "Medium",
    "health_score": 56.0,
    "risk_factors": [
        {
            "factor": "Glucose Level",
            "value": 148,
            "status": "danger",
            "message": "Your fasting glucose (148 mg/dL) is significantly high.",
            "impact": 0.35
        }
    ],
    "recommendations": [
        "Monitor blood sugar regularly.",
        "Aim for 150 minutes of aerobic activity per week."
    ],
    "summary": "MODERATE RISK: You have a 47.0% diabetes risk."
}
```

---

## 🧠 AI Models

Three models are trained and the best performer is automatically selected:

| Model | Type | Purpose |
| ----- | ---- | ------- |
| Logistic Regression | Classification | Baseline, interpretable |
| Random Forest | Ensemble | Feature importance |
| Gradient Boosting | Ensemble | High accuracy |

### Health Score Calculation

The **AI Health Score** (0-100) considers:

- Glucose levels (fasting range)
- BMI classification
- Blood pressure readings
- Age factor
- Exercise habits
- Sleep quality
- Smoking status
- AI risk probability

---

## 🧬 Health Metrics & Calculation Guide

| Metric 📊 | Description 📝 | How it is Calculated / Measured 🛠️ |
| :--- | :--- | :--- |
| **BMI** | Measures body fat based on height and weight. | **Formula**: `Weight (kg) ÷ [Height (m)]²`. |
| **Glucose** | Concentration of glucose in the blood. | Measured using a **Digital Glucometer**. |
| **Blood Pressure** | Pressure in the arteries. | Measured with a **BP Cuff** (Diastolic). |
| **Skin Thickness** | Subcutaneous fat thickness. | Measured with **Skin Calipers** on triceps. |
| **Insulin** | Hormone regulating glucose. | Requires clinical **Laboratory Blood Test**. |
| **Diabetes Pedigree** | Genetic risk factor. | Calculated based on **Family History**. |

---

## 🗺️ Roadmap

- [x] Diabetes risk prediction (MVP)
- [x] AI Health Score
- [x] Explainable AI risk factors
- [x] Patient database
- [x] Analytics dashboard
- [x] Premium dark-mode UI
- [ ] JWT Authentication
- [ ] Heart disease prediction
- [ ] AI Symptom Checker (LLM-based)
- [ ] PDF report upload + summary
- [ ] Doctor dashboard
- [ ] Multi-language support
- [ ] Deployment (AWS/GCP)

---

[MIT License](LICENSE) — free to use, modify, and distribute. 🔓️

---

AI Health-Tech Platform v1.0.0 · Powered by Machine Learning 🧠
