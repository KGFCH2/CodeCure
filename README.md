# 🩺 CodeCure — AI Health-Tech Platform 🧬

> AI-driven health-tech solution for diabetes risk prediction, health scoring, and personalized medical insights powered by machine learning.

![Python](https://img.shields.io/badge/Python-3.14+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-green?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8+-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🎯 Project Overview

CodeCure is an intelligent health-tech platform designed to provide proactive health insights through artificial intelligence. By analyzing clinical metrics, it helps users and healthcare providers identify potential diabetes risks early, offering a comprehensive "Health Score" alongside actionable recommendations and explainable AI insights.

---

## 🛠️ Tech Stack & Tools

| Component | Technology |
| --------- | ---------- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python API) |
| **Machine Learning** | [Scikit-Learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) |
| **Database & ORM** | [SQLite](https://sqlite.org/) / [PostgreSQL](https://www.postgresql.org/) + [SQLAlchemy](https://www.sqlalchemy.org/) |
| **Frontend Utilities** | HTML5, CSS3, Vanilla JavaScript, Lucide Icons |
| **Persistence** | Hybrid: Server-side DB + Client-side `LocalStorage` |
| **Deployment** | [Vercel](https://vercel.com/) (Serverless) |

---

## ⚡ Key Features

- 🔮 **Diabetes Risk Prediction**: ML models predict risk from 8+ clinical metrics.
- 💯 **AI Health Score**: A 0-100 snapshot of overall health status.
- 🔍 **Explainable AI (XAI)**: Detailed breakdown of risk factors (Glucose, BMI, etc.).
- 📑 **Modal Summary**: View instant patient details in a sleek dashboard modal.
- 💬 **AI Assistant**: Specialized chatbot for system FAQs and medical definitions.
- 📥 **PDF Reports**: Export comprehensive medical reports directly to your device.
- 🌐 **Vercel Optimized**: Fully compatible with serverless environments and ephemeral storage.

---

## 🚀 Deployment (Vercel)

CodeCure is optimized for Vercel deployment using serverless functions.

1. **Database**: Automatically switches to `/tmp/codecure.db` in serverless mode to bypass read-only filesystems.
2. **Persistence**: Implements a `LocalStorage` fallback so your dashboard data survives server resets.
3. **Configuration**: Uses `vercel.json` for seamless FastAPI routing.

### Persistent Storage (Cloud)
To enable shared database storage across all users, connect a **Vercel Postgres** or **Neon DB** through the Vercel dashboard. The system will automatically detect the connection.

---

## 🏗️ Local Installation

```bash
# 1. Clone & Navigate
git clone https://github.com/KGFCH2/CodeCure.git
cd CodeCure

# 2. Virtual Env
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows

# 3. Dependencies
pip install -r requirements.txt

# 4. Initialize AI
python train_model.py

# 5. Run Server
python -m uvicorn main:app --reload
```

Access at `http://127.0.0.1:8000`.

---

## 📁 Project structure

```text
CodeCure/
├── main.py            # FastAPI service & Chatbot logic
├── database.py        # SQLite/Postgres connection manager
├── vercel.json        # Deployment configuration
├── static/
│   ├── style.css      # Premium Glassmorphism UI
│   ├── script.js      # Core Vanilla JS (Predictions, Dashboard, AI Logic)
│   └── codecure_kb.json # Chatbot Knowledge Base
├── templates/
│   └── index.html     # Single Page Application Shell
└── model/             # Trained AI Models
```

---

## 📜 License & Support
MIT License. Created for the future of intelligent healthcare delivery.

*Built with ❤️ by the CodeCure Team.*
