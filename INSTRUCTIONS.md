# 🏥 CodeCure Local Setup & Optional AI Chatbot Guide 🤖

This document contains instructions for setting up, training, and deploying the **CodeCure Local-First AI Health-Tech Platform**. It also details the current features of the project and how to optionally extend it with an AI Chatbot feature.

---

## 1. Current Project State & Features 🌟

CodeCure has been significantly upgraded and currently includes the following features:

- **Theme & UI**: Light Mode / Premium Medical Green aesthetic with modern Lucide Icons (replacing generic emojis).
- **Core ML Engine**: Predicts diabetes risk using Scikit-learn (evaluating Logistic Regression, Random Forest, and Gradient Boosting to pick the best model).
- **AI Health Score & XAI**: Calculates a comprehensive 0-100 health score with Explainable AI (XAI) risk factors.
- **Patient Database**: Tracks patient history using SQLite & SQLAlchemy.
- **Single-Page HD Clinical PDF Engine**: Users can download a perfectly formatted, single-page, hospital-grade AI Diagnostic Report containing biometric breakdowns and lifestyle recommendations.

> **💡 Important Note**: The current version of CodeCure runs **100% locally**. The AI predictions, health scoring, and PDF generation **do not use or require any external API keys**.

---

## 2. Environment Setup 🛠️

### Prerequisites

- **Python 3.10+**
- **Virtual Environment** (Recommended)

### Installation

1. **Navigate to the project folder**:

   ```bash
   cd CodeCure
   ```

2. **Setup Environment**:

   ```bash
   python -m venv venv
   # Activate on Windows:
   venv\Scripts\activate
   # Activate on macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

---

## 3. AI Model Training 🧠

Before you deploy the app for the first time, you must train the machine learning models. The engine evaluates multiple classifiers and saves the best performer.

Run the training script:

```bash
python train_model.py
```

- **Outputs**: `model/diabetes_model.pkl`, `model/scaler.pkl`, and `model/feature_names.pkl`.
- **Dataset**: Built using `diabetes.csv`.

---

## 4. Running the Application 🚀

Start the FastAPI application using Uvicorn:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- **Local Address**: Access the platform at [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Dashboard**: Track patient metrics and view the historical database in real-time.

---

## 5. HD PDF Generation Setup 📄

We have implemented a **Bulletproof HD Clinical Engine** for report downloading.
No backend configuration is needed for this feature! It uses `html2pdf.js` securely isolated directly in the browser's DOM (`index.html`).

- **How to test**: Run an AI analysis on the frontend and click **"Download Report (PDF)"**.
- **Note**: The engine forces an A4 size generation, ensuring the entire medical report fits elegantly on one single page.

---

## 6. [OPTIONAL] Future Expansion: AI Chatbot 🤖

*Note: This feature is **not required** for the core functionality of CodeCure. The project works 100% locally without any API keys.*

To give answers to project-related questions through an AI chatbot, you can integrate the **Google Gemini API**.

### AI Chatbot Prerequisites

1. **Get API Key**: Visit [Google AI Studio](https://aistudio.google.com/) and yield a free API key.
2. **Install Library**:

   ```bash
   pip install google-generativeai
   ```

### Implementation Steps

1. **Add API Config**: Store your key securely in a `.env` file.
2. **Backend Route**: Add the following code snippet to your `main.py`:

   ```python
   import google.generativeai as genai

   genai.configure(api_key="YOUR_GEMINI_API_KEY")

   @app.post("/api/chat")
   async def chat(user_message: str):
       model = genai.GenerativeModel("gemini-1.5-flash")
       response = model.generate_content(
           f"You are the CodeCure Medical AI Assistant. Answer this question based on healthcare knowledge: {user_message}"
       )
       return {"response": response.text}
   ```

3. **Frontend Integration**:
   - Add a fixed chat interface bubble in `templates/index.html`.
   - Use `fetch('/api/chat', ...)` to send messages to the backend and append the responses to the chat window.

---

## 7. Icons & Assets 🖼️

- CodeCure relies on **Lucide Icons** for a premium clinical feel.
- **Provider**: `https://unpkg.com/lucide@latest`
- **Favicon**: Uses the custom `cure.png` placed in the `static/` directory.

---

## 8. License 📄

This project is licensed under the [MIT License](LICENSE). 🔓️

---

## 9. Health Metrics & Calculation Guide 🧬

Understanding how the health parameters used in CodeCure are calculated or measured is essential for accurate clinical prediction.

| Metric 📊 | Description 📝 | How it is Calculated / Measured 🛠️ |
| :--- | :--- | :--- |
| **BMI (Body Mass Index)** | Measures body fat based on height and weight. | **Formula**: `Weight (kg) ÷ [Height (m)]²`. |
| **Glucose** | Concentration of glucose in the blood. | Measured using a **Digital Glucometer**. Fasting values are preferred. |
| **Blood Pressure** | Pressure in the arteries. | Measured with a **BP Cuff**. We use the **Diastolic** (resting) pressure. |
| **Skin Thickness** | Subcutaneous fat thickness. | Measured with **Skin Calipers** on the triceps muscle area. |
| **Insulin** | Hormone regulating glucose. | Requires a **Laboratory Blood Test** (Serum Insulin). |
| **Diabetes Pedigree** | Genetic risk factor. | Calculated based on **Family History** (parents/grandparents with diabetes). |
| **Age** | Patient's chronological age. | Number of years since birth. |
| **Pregnancies** | Clinical history. | Total number of times a female patient has been pregnant. |

---

## ✅ Quick Setup Checklist

- [ ] Python 3.10+ installed
- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Model trained (`python train_model.py`)
- [ ] App running (`python -m uvicorn main:app --reload`)

---

## 🛠️ Maintenance & Updates

- **Database**: The `codecure.db` file stores all patient data. Back it up regularly.
- **Model Retraining**: If you update `diabetes.csv` with new data, re-run `train_model.py` to improve accuracy.

---

**Happy Coding!** 🚀
