# 🩺 CodeCure — AI Health-Tech Platform 🧬

> AI-driven health-tech solution for diabetes risk prediction, health scoring, and personalized medical insights powered by machine learning.

![Python](https://img.shields.io/badge/Python-3.14+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-green?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8+-orange?style=for-the-badge&logo=scikit-learn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

---

## 🎯 Project Overview

CodeCure is an intelligent health-tech platform designed to provide proactive health insights through artificial intelligence. By analyzing clinical metrics, it helps users and healthcare providers identify potential diabetes risks early, offering a comprehensive "Health Score" alongside actionable recommendations and explainable AI insights.

---

## 🛠️ Tech Stack & Tools

| Component | Technology |
| --------- | ---------- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python API) |
| **Machine Learning** | [Scikit-Learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) |
| **Database & ORM** | [SQLite](https://sqlite.org/) + [SQLAlchemy](https://www.sqlalchemy.org/) |
| **Frontend Utilities** | HTML5, CSS3 (Glassmorphism design), Vanilla JavaScript |
| **Templating Engine** | [Jinja2](https://palletsprojects.com/p/jinja/) |
| **Deployment/Server** | [Uvicorn](https://www.uvicorn.org/) (ASGI server) |
| **Serialization** | Joblib (for ML model persistence) |

---

## ⚡ Features

| Feature | Description |
| ------- | ----------- |
| 🔮 **Diabetes Risk Prediction** | ML models predict diabetes risk from clinical metrics (Glucose, BMI, etc.) |
| 💯 **AI Health Score** | A unique 0-100 index providing an immediate snapshot of health status |
| 🔍 **Explainable AI (XAI)** | Transparent analysis showing exactly which factors contributed to the risk |
| 📋 **Personalized Recommendations** | Dynamic health advice generated based on individual risk profiles |
| 📊 **Analytics Dashboard** | Real-time tracking of patient statistics and risk distributions |
| 🗄️ **Patient Database** | Robust SQLite storage via SQLAlchemy for long-term health tracking |
| 🏥 **Clinical Parameters** | Support for 8+ metrics including Insulin, Blood Pressure, and Age |

---

## 🏗️ Technical Workflow

1. **Dataset Handling**: The platform uses clinical data (based on the Pima Indians Diabetes statistical profile) for predictive analysis.
2. **Standardization**: Input parameters are scaled using `StandardScaler` to ensure prediction accuracy across different measurement units.
3. **AI Engine**: A trained classifier (Logistic Regression/Random Forest) assesses risk probabilities based on user-provided clinical metrics.
4. **API Layer**: FastAPI handles asynchronous requests, serving the ML predictions and retrieving records from the SQLite backend.
5. **Dashboard Analytics**: Historical patient data is aggregated into statistical visualizations for tracking health trends.
6. **Output Generation**: The frontend presents complex AI results through a user-friendly single-page application with modern UI components.

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.10+
- Virtual environment tool (`venv`)

### Setup Instructions

```bash
# 1. Navigate to project directory
cd CodeCure

# 2. Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install project dependencies
pip install -r requirements.txt

# 4. Train the AI model
# This generates the model/ folder and initialization data
python train_model.py

# 5. Start the application server
python -m uvicorn main:app --reload
```

Access the platform at `http://127.0.0.1:8000` once the server is running.

---

## 📁 Project Structure

```text
CodeCure/
├── main.py            # Main API service using FastAPI
├── train_model.py     # Training scripts and synthetic data generation
├── database.py        # Database models and session management
├── schemas.py         # Data validation and API response models
├── requirements.txt   # List of Python dependencies
├── templates/
│   └── index.html     # Web dashboard (Modern SPA)
├── static/
│   └── style.css      # Custom styling and branding
└── model/
    ├── diabetes_model.pkl    # Trained AI binary
    ├── scaler.pkl            # Trained scaler binary
    └── feature_names.pkl     # Meta-info for model inputs
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📧 Contact & Support

For any inquiries or support regarding **CodeCure**, please open an issue in the repository or contact the project maintainers.

---
*Built with ❤️ for a healthier future.*
