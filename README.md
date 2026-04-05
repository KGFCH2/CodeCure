# 🏥 CodeCure — AI Diabetes Risk Prediction Platform 🩺

> Advanced AI-powered health-tech platform for predicting diabetes risk, analyzing health metrics, and assessing individual risk factors using cutting-edge machine learning models.

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/ScikitLearn-ML-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-00d1b2?style=for-the-badge&logo=render&logoColor=white)

---

## 🎯 Project Overview

CodeCure is an intelligent health-tech platform designed to predict diabetes risk with high accuracy. By analyzing patient health metrics (glucose levels, BMI, blood pressure, insulin, age, family history, etc.) and lifestyle factors, it helps individuals and healthcare providers assess diabetes risk early, offering comprehensive risk scoring alongside explainable AI insights for preventive healthcare.

---

## 🛠️ Tech Stack & Tools

| Component | Technology |
| --------- | ---------- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python API) |
| **Machine Learning** | [Scikit-Learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) |
| **Health Analytics** | Pre-trained Diabetes Risk Classification Model |
| **Database & ORM** | [SQLite](https://sqlite.org/) / [PostgreSQL](https://www.postgresql.org/) + [SQLAlchemy](https://www.sqlalchemy.org/) |
| **Frontend Utilities** | HTML5, CSS3, Vanilla JavaScript, Lucide Icons |
| **Persistence** | Hybrid: Server-side DB + Client-side `LocalStorage` |
| **Deployment** | [Render](https://render.com/) (Single-host Web Service) |

---

## ⚡ Key Features

- 🏥 **Diabetes Risk Prediction**: Advanced ML models analyze health metrics for accurate risk assessment.
- 💯 **Risk Score (0-100)**: Quick health risk assessment metric.
- 🔍 **Explainable AI (XAI)**: Detailed breakdown of which health factors contribute to diabetes risk (glucose, BMI, family history, age, etc.).
- 📊 **Health Dashboard**: Analytics with patient/record history and health metric visualization.
- 👤 **Patient Profiles**: Input health metrics (glucose, blood pressure, insulin, BMI, pregnancy history, etc.) with automatic analysis.
- 💬 **Health Assistant**: Chatbot for health FAQs and diabetes prevention guidance.
- 📥 **Detailed Reports**: Export comprehensive risk assessment reports with health analysis as PDF.

---

## 🚀 Deployment Options

### Option 1: Render Web Service (Recommended)

Deploy the entire application (Frontend + Backend) as a single service on Render.

- ✅ Easy deployment with single URL
- ✅ Automatic model training on build
- ✅ Integrated health check and logs
- ✅ SSL/HTTPS enabled by default

**👉 Quick Start**: Copy `.env.example` to `.env`, add your `GROQ_API_KEY`, and push to GitHub. See [RENDER_DEPLOY_STEPS.md](RENDER_DEPLOY_STEPS.md) for step-by-step production deployment instructions.

---

## 🏗️ Local Installation & Testing ✅ Verified Working

```bash
# 1. Clone Repository
git clone https://github.com/KGFCH2/CodeCure.git
cd CodeCure

# 2. Create Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Dependencies
pip install -r requirements.txt
# Note: Pre-trained models are included, so app works even if scikit-learn installation takes time

# 4. Set Environment Variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY from https://console.groq.com/keys

# 5. Run the Application

# Option A: Using Python directly
python main.py

# Option B: Using Uvicorn (with auto-reload)
uvicorn main:app --reload

# Server starts at http://127.0.0.1:8000 or http://localhost:8000
```

### ✅ Verification Checklist

- [ ] Navigate to `http://localhost:8000` — you should see the CodeCure dashboard
- [ ] Open browser DevTools (F12) → Console — should show no errors
- [ ] Go to `/api/health` — should return `{"status": "healthy", "model_loaded": true}`
- [ ] Input health metrics (glucose, BMI, blood pressure, etc.) and submit — should return diabetes risk score
- [ ] Open DevTools → Application → LocalStorage — should show saved predictions

### 📁 Project Structure

```text
CodeCure/
├── main.py              # FastAPI backend with all endpoints
├── database.py          # SQLAlchemy models and database setup
├── schemas.py           # Pydantic schemas for request/response validation
├── train_model.py       # ML model training script
├── requirements.txt     # All Python dependencies
├── static/
│   ├── style.css        # Glassmorphism UI styling
│   ├── script.js        # Core application logic (predictions, dashboard, chatbot)
│   ├── codecure_kb.json # ChemiBot knowledge base
│   └── favicon.png      # App icon
├── templates/
│   └── index.html       # Single Page Application (SPA) shell
├── model/               # Pre-trained ML models
│   ├── diabetes_model.pkl      # Diabetes Risk Classification Model
│   ├── scaler.pkl              # Feature scaling for input normalization
│   └── feature_names.pkl       # Feature column names
├── render.yaml          # Render.com deployment config (Python 3.11)
├── vercel.json          # Vercel deployment config
└── .env.example         # Environment variable template
```

---

## 📜 License & Support

[MIT License](LICENSE). Created for intelligent healthcare and preventive medicine.

*Built with ❤️ by the CodeCure Team.*
