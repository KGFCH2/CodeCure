# 🧪 CodeCure Local Development Guide

Quick setup guide for running CodeCure locally. **For deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).**

---

## ⚡ Features

- ✅ **AI Chemical Toxicity Prediction** - Real-time analysis using SMILES strings
- ✅ **Risk Scoring System** - 0-100 toxicity risk metric  
- ✅ **Explainable AI** - View which molecular features influence risk
- ✅ **Dashboard Analytics** - Track prediction history with LocalStorage
- ✅ **ChemiBot Assistant** - AI chatbot for toxicology questions
- ✅ **PDF Reports** - Export detailed analysis reports
- ✅ **Zero Database Required** - Data stored in browser LocalStorage by default

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

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add GROQ_API_KEY from https://console.groq.com/keys
   ```

5. **Start the server**:
   ```bash
   python main.py
   ```
   
   Server starts at **http://localhost:8000** ✅

---

## 🧪 Testing Checklist

- [ ] Open http://localhost:8000 in browser
- [ ] Submit a test SMILES string (example: `CCO` for ethanol)
- [ ] View toxicity prediction result
- [ ] Open DevTools (F12) → Application → LocalStorage → See predictions stored
- [ ] Refresh page → Predictions still visible ✅ (LocalStorage working)

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Main web app |
| GET | `/api/health` | Health check & diagnostics |
| POST | `/api/predict` | Toxicity prediction |
| GET | `/api/dashboard` | Analytics dashboard |
| GET | `/api/patients` | Patient/compound history |

---

## 🞂 Environment Variables

Create `.env` file:

```
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

👉 **See [DEPLOYMENT.md](DEPLOYMENT.md)** for 3 complete deployment options

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: fastapi` | Run `pip install -r requirements.txt` |
| `GROQ_API_KEY not set` | Copy `.env.example` → `.env` and add your API key |
| `Model failed to load` | Check `/model/` directory exists with model files |
| `Port 8000 in use` | Use different port: `python -m uvicorn main:app --port 8001` |
| `Can't connect to localhost` | Ensure server is running with proper startup message |

---

## 💡 Tech Stack

- **Backend**: FastAPI + SQLAlchemy
- **ML**: Scikit-Learn + NumPy + Pandas  
- **Cheminformatics**: RDKit (SMILES parsing)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Data Storage**: LocalStorage (browser) + Optional PostgreSQL
- **API Key**: Groq (ChemiBot integration)

---

## 📚 More Documentation

- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide (3 options)
- [GitHub Repository](https://github.com/KGFCH2/CodeCure) - Full source code

---

**Happy coding! 🚀**
