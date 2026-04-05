# 🏥 CodeCure Local Development Guide

Quick setup guide for running CodeCure locally. **For deployment, see [RENDER_DEPLOY_STEPS.md](RENDER_DEPLOY_STEPS.md).**

---

## ⚡ Features

- ✅ **AI Diabetes Risk Prediction** - Real-time analysis using patient health metrics
- ✅ **Risk Scoring System** - 0-100 diabetes risk metric  
- ✅ **Explainable AI** - View which health factors influence risk
- ✅ **Dashboard Analytics** - Track prediction history with LocalStorage/DB
- ✅ **Health Assistant** - AI chatbot for diabetes prevention and health questions
- ✅ **PDF Reports** - Export detailed analysis reports
- ✅ **FastAPI Backend** - Unified server for application and API
- ✅ **Render-Ready** - Configured for single-service deployment

---

## 📥 Quick Setup

### Prerequisites

✅ Python 3.10+ (Windows, macOS, or Linux)  
✅ pip package manager  
✅ Git

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/KGFCH2/CodeCure.git
   cd CodeCure
   ```

2. **Create virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Train the AI model**:

   ```bash
   python train_model.py
   ```

5. **Configure environment**:

   ```bash
   cp .env.example .env
   # Edit .env and add GROQ_API_KEY from https://console.groq.com/keys
   ```

6. **Start the server**:

   **Option A:** Using Python directly

   ```bash
   python main.py
   ```

   **Option B:** Using Uvicorn (with auto-reload on file changes)

   ```bash
   uvicorn main:app --reload
   ```

   Server starts at **<http://127.0.0.1:8000>** or **<http://localhost:8000>** ✅

---

## 🧪 Testing Checklist

- [ ] Open <http://localhost:8000> in browser
- [ ] Input health metrics (Glucose: 120, BMI: 28, Age: 45, etc.)
- [ ] View diabetes risk prediction result
- [ ] Clear browser data → See how items persist if DATABASE_URL is set
- [ ] Consult AI Health Assistant for personalized tips

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
| -------- | ---------- | --------- |
| GET | `/` | Main web app (Unified) |
| GET | `/api/health` | Health check & diagnostics |
| POST | `/api/predict` | Diabetes risk prediction |
| GET | `/api/dashboard` | Analytics dashboard |
| GET | `/api/patients` | Patient health records history |

---

## 🞂 Environment Variables

Create `.env` file:

```bash
GROQ_API_KEY=your_api_key_here
DATABASE_URL=             # Optional - leave blank for LocalStorage
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

- **GROQ_API_KEY**: Required - From [Groq Console](https://console.groq.com/keys)
- **DATABASE_URL**: Optional - PostgreSQL URL (if using database)
- **ALLOWED_ORIGINS**: CORS for cross-site requests

---

## 🚀 Deployment

For production deployment on Vercel, Render, or both:

👉 **See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete deployment instructions

---

## 🆘 Troubleshooting

| Issue | Solution |
| ------- | ---------- |
| `ModuleNotFoundError: fastapi` | Run `pip install -r requirements.txt` |
| `GROQ_API_KEY not set` | Copy `.env.example` → `.env` and add your API key |
| `Model failed to load` | Check `/model/` directory exists with model files |
| `Port 8000 in use` | Use different port: `python -m uvicorn main:app --port 8001` |
| `Can't connect to localhost` | Ensure server is running with proper startup message |

---

## 💡 Tech Stack

- **Backend**: FastAPI + SQLAlchemy
- **ML**: Scikit-Learn + NumPy + Pandas  
- **Health Analytics**: Pre-trained Diabetes Risk Classification Model
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Data Storage**: LocalStorage (browser) + Optional PostgreSQL
- **API Key**: Groq (Health Assistant chatbot integration)

---

## 🧭 File Working Principles

- `main.py`: Starts the FastAPI app, serves the UI, and handles prediction, dashboard, health, and chatbot endpoints.
- `database.py`: Defines the SQLAlchemy models and database connection used to store patient and prediction data.
- `schemas.py`: Defines the Pydantic request and response models used to validate API data.
- `train_model.py`: Trains or refreshes the diabetes model artifacts stored in the `model/` folder.
- `static/script.js`: Runs the frontend logic for predictions, dashboard updates, chatbot messages, and PDF reports.
- `static/style.css`: Controls the visual design, layout, responsiveness, and UI interactions.
- `static/config.js`: Chooses the correct backend URL for local and deployed environments.
- `templates/index.html`: Renders the main page shell and injects runtime environment values for the frontend.
- `static/codecure_kb.json`: Provides fallback chatbot knowledge when the backend AI response is unavailable.
- `model/`: Stores the trained ML files needed for prediction at runtime.
- `requirements.txt`: Lists the Python packages required to run and deploy the app.
- `render.yaml` and `vercel.json`: Define deployment settings for Render and Vercel.
- `DEPLOYMENT_GUIDE.md`: Explains how to deploy the backend and frontend step by step.
- `README.md`: Gives the project overview and high-level feature summary.

## 📚 More Documentation

- [README.md](README.md) - Project overview
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Deployment guide
- [GitHub Repository](https://github.com/KGFCH2/CodeCure) - Full source code

---

**Happy Predicting!** 🏥
