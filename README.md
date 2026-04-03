# ⚗️ CodeCure — AI Chemical Toxicity Prediction Platform 🧪

> Advanced AI-powered chemical informatics platform for predicting drug toxicity, analyzing molecular properties, and assessing chemical safety using cutting-edge machine learning models.

![Python](https://img.shields.io/badge/Python-3.14+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-green?style=for-the-badge&logo=fastapi&logoColor=white)
![RDKit](https://img.shields.io/badge/RDKit-Cheminformatics-purple?style=for-the-badge&logo=molecule&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🎯 Project Overview

CodeCure is an intelligent chemical informatics platform designed to predict and analyze drug toxicity with high accuracy. By analyzing molecular structures (via SMILES notation), chemical descriptors (LogP, molecular weight, hydrogen bond donors/acceptors, etc.), and structural features, it helps researchers and pharmaceutical scientists assess toxicity risks early, offering comprehensive risk scoring alongside explainable AI insights.

---

## 🛠️ Tech Stack & Tools

| Component | Technology |
| --------- | ---------- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python API) |
| **Machine Learning** | [Scikit-Learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) |
| **Cheminformatics** | [RDKit](https://www.rdkit.org/) (Molecular descriptor calculation from SMILES) |
| **Database & ORM** | [SQLite](https://sqlite.org/) / [PostgreSQL](https://www.postgresql.org/) + [SQLAlchemy](https://www.sqlalchemy.org/) |
| **Frontend Utilities** | HTML5, CSS3, Vanilla JavaScript, Lucide Icons |
| **Persistence** | Hybrid: Server-side DB + Client-side `LocalStorage` |
| **Deployment** | [Vercel](https://vercel.com/) (Serverless) |

---

## ⚡ Key Features

- 🧪 **Chemical Toxicity Prediction**: Advanced ML models analyze molecular properties and SMILES strings for accurate toxicity assessment.
- 💯 **Toxicity Risk Score**: A 0-100 scoring system for quick chemical risk assessment.
- 🔍 **Explainable AI (XAI)**: Detailed breakdown of which molecular features contribute to toxicity (LogP, molecular weight, aromatic rings, HBD/HBA, etc.).
- 📊 **Molecular Dashboard**: High-level analytics with compound history and molecular property visualization.
- 🧬 **SMILES Processing**: Input molecules via SMILES notation with automatic descriptor calculation using RDKit.
- 💬 **ChemiBot Assistant**: Specialized chatbot for toxicology FAQs, SMILES guidance, and chemical property explanations.
- 📥 **Detailed Reports**: Export comprehensive toxicity assessment reports with molecular analysis as PDF.

---

## 🚀 Deployment Options

### Option 1: LocalStorage Only (Simplest | No Database)
Data persists **only in your browser**. Perfect for personal use, testing, or demos.
- ✅ Zero database setup
- ✅ Deploy to Vercel in 5 minutes
- ❌ Data only on this device
- ❌ Single browser (data won't sync)

### Option 2: Vercel Only (Simple | Optional Database)
Deploy on Vercel. Optionally add Vercel Postgres for shared cloud storage.
- ✅ Easy deployment
- ✅ Single-click Postgres integration
- ✅ Automatic scaling
- 💰 Postgres is paid tier

### Option 3: Render + Vercel (Production | Recommended)
Split architecture: Backend on Render, Frontend on Vercel for maximum control.
- ✅ Full separation of concerns
- ✅ Production-ready
- ✅ Dynamic API URL configuration
- ✅ Optional PostgreSQL database
- 📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guide

**👉 Quick Start**: Copy `.env.example` to `.env`, add your `GROQ_API_KEY`, and deploy to Vercel!

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

# 4. Set Environment Variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY from https://console.groq.com/keys

# 5. Run the Application
python main.py
# Server starts at http://localhost:8000
```

### ✅ Verification Checklist

- [ ] Navigate to `http://localhost:8000` — you should see the CodeCure dashboard
- [ ] Open browser DevTools (F12) → Console — should show no errors
- [ ] Go to `/api/health` — should return `{"status": "healthy", "model_loaded": true}`
- [ ] Submit a toxicity prediction — should return risk score and factors
- [ ] Open DevTools → Application → LocalStorage — should show saved predictions

### 📁 Project Structure

```
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
│   ├── diabetes_model.pkl      # Classification model
│   ├── scaler.pkl              # Feature scaling
│   └── feature_names.pkl       # Feature column names
├── render.yaml          # Render.com deployment config (Python 3.11)
├── vercel.json          # Vercel deployment config
├── DEPLOYMENT.md        # Complete deployment guide (3 options)
└── .env.example         # Environment variable template
```

---

## 📜 License & Support

MIT License. Created for the future of intelligent healthcare delivery.

*Built with ❤️ by the CodeCure Team.*
