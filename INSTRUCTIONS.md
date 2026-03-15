# 🏥 CodeCure Local Setup & Vercel Deployment Guide 🚀

This document details the setup, training, and deployment processes for the **CodeCure AI Health-Tech Platform**.

---

## 1. Project Features 🌟

- **AI Prediction**: Real-time diabetes risk assessment using optimized ML models.
- **AI Health Score**: A unique 0-100 metric for instant health status visibility.
- **Explainable AI (XAI)**: Breakdown of risk factors informing the AI's decision.
- **Smart Dashboard**: High-level analytics with a detailed patient history table.
- **Patient Details Modal**: **[NEW]** Click a patient in the dashboard to see a summarized AI breakdown in a modal window.
- **AI Assistant**: **[NEW]** Local knowledge-based chatbot for answering CodeCure and health-related questions.
- **Hospital-Grade Reports**: One-page clinical PDF generation for easy sharing/printing.
- **Optimized Performance**: Core logic separated into `script.js` for faster loading and cleaner code.
- **Hybrid Persistence**: Optimized for serverless; data survives resets via `LocalStorage`.

---

## 2. Local Environment Setup 🛠️

### Prerequisites
- Python 3.10+
- `venv` (Virtual Environment)

### Installation
1. **Navigate to the project folder**:
   ```bash
   cd CodeCure
   ```
2. **Setup Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 3. AI Model Training 🧠

Before running the server, you must train the internal AI models:
```bash
python train_model.py
```
- **Inputs**: `diabetes.csv`
- **Outputs**: `model/diabetes_model.pkl`, `scaler.pkl`, `feature_names.pkl`
- **Logic**: Evaluates multiple classifiers and picks the most accurate one.

---

## 4. Running Locally 🚀

```bash
python -m uvicorn main:app --reload
```
Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## 5. Vercel Deployment Guide ☁️

CodeCure is 100% production-ready for **Vercel**.

### Deployment Steps:
1. **Push to GitHub**: Ensure all files including `vercel.json` and the `model/` directory are pushed.
2. **Vercel Project**: Import the repository into Vercel.
3. **Auto-Configuration**: Vercel will detect `main.py` and the Python runtime automatically.

### Database Persistence on Vercel:
Because Vercel serverless functions have a read-only filesystem (except `/tmp`), the application follows these rules:
- **Default (Free)**: Uses `/tmp/codecure.db`. Data is stored temporarily and mirrored in your browser's `LocalStorage`.
- **Permanent (Recommended)**: Connect a **Vercel Postgres** database in the Vercel dashboard. The app will automatically detect `POSTGRES_URL` and use it for permanent, shared storage.

---

## 6. Chatbot Customization 🤖

The chatbot uses `static/codecure_kb.json` as its brain. To add more answers:
1. Open `static/codecure_kb.json`.
2. Add a new object with `keywords`, `question`, and `answer`.
3. The chatbot will instantly start recognizing the new keywords.

---

## 7. Troubleshooting 🔍

- **Blank PDFs**: Ensure you are using a Chromium-based browser (Chrome, Edge) for the best `html2pdf.js` results.
- **Dashboard Resetting**: If data disappears on refresh, ensure your browser allows `LocalStorage`. For permanent storage across devices, use a Postgres DB.
- **Model Errors**: If the AI fails to predict, ensure you ran `python train_model.py` and that the `model/` folder contains the `.pkl` files.

---

**Happy Deploying!** 🩺
