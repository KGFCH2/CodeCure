# ⚗️ CodeCure Chemical Toxicity Prediction — Setup & Deployment Guide 🚀

This document details the setup, training, and deployment processes for the **CodeCure AI Chemical Toxicity Prediction Platform**.

---

## 1. Project Features 🌟

- **Toxicity Prediction**: Real-time chemical toxicity assessment using advanced ML models trained on molecular descriptors.
- **Toxicity Risk Score**: A unique 0-100 metric for instant chemical safety assessment.
- **Explainable AI (XAI)**: Breakdown of molecular features influencing toxicity (LogP, MW, aromatic rings, HBD, HBA, TPSA, etc.).
- **Smart Dashboard**: Analytics dashboard with detailed compound analysis and molecular property visualization.
- **SMILES Input**: Input molecules via SMILES notation for instant toxicity analysis.
- **Molecular Details Modal**: Click a compound in the dashboard to see detailed toxicity breakdown and molecular properties.
- **ChemiBot Assistant**: Specialized chatbot for toxicology FAQs, SMILES format help, and molecular descriptor explanations.
- **Detailed Reports**: Generate comprehensive toxicity assessment reports with molecular analysis for sharing/printing.
- **Optimized Performance**: Core prediction logic separated for faster loading and cleaner code.
- **Hybrid Persistence**: Optimized for serverless; data survives resets via `LocalStorage` + optional PostgreSQL.

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

2. **Setup Environment Variables**:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Groq API key:

   ```text
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

   > **Note**: Get your API key from [Groq Console](https://console.groq.com/keys)

3. **Setup Virtual Environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   ```

4. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

---

## 3. AI Model Training 🧠

Before running the server, you must train the internal AI models:

```bash
python train_toxicity_model.py
```

- **Inputs**: Toxicity dataset with molecular SMILES strings and toxicity labels (tox21_processed.csv)
- **Outputs**: `model/toxicity_model.pkl`, `toxicity_scaler.pkl`, `toxicity_feature_names.pkl`
- **Logic**: Extracts molecular descriptors from SMILES using RDKit, evaluates multiple classifiers, and picks the most accurate one
- **Molecular Features**: LogP (lipophilicity), MW (molecular weight), HBD (hydrogen bond donors), HBA (hydrogen bond acceptors), TPSA (topological polar surface area), and more

---

## 4. Running Locally 🚀

```bash
python -m uvicorn main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## 5. Deployment Architecture 🏗️

CodeCure supports **two deployment models**:

### **Model A: Vercel Only (Recommended for Quick Start)**

- Single deployment on Vercel
- Best for: Simple projects, prototyping, low traffic

### **Model B: Render Backend + Vercel Frontend (Recommended for Production)**

- FastAPI backend on Render.com
- Frontend on Vercel
- Best for: Production, high traffic, persistent storage, better performance

---

## 6. Render Deployment Guide (Backend) 🚀

Render.com is ideal for hosting the FastAPI backend with persistent storage and background workers.

### Step 1: Prepare Repository for Render

1. **Create a `render.yaml` file** in your project root:

```yaml
services:
  - type: web
    name: codecure-api
    env: python
    plan: free
    buildCommand: "pip install -r requirements.txt && python train_toxicity_model.py"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port 8080"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.7
      - key: GROQ_API_KEY
        sync: false  # Must be set manually in dashboard
```

1. **Update `main.py`** to use `PORT` environment variable:  

In your main.py, ensure the app runs on the Render-provided port:

```python
import os
port = int(os.environ.get("PORT", 8080))
```

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub account
3. Click **"New +"** → **"Web Service"**
4. Select your CodeCure repository
5. Fill in the deployment settings:
   - **Name**: `codecure-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python train_toxicity_model.py`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8080`
   - **Plan**: Free (or paid for production)

6. Click **"Create Web Service"**
7. Go to **Settings** → **Environment** and add:
   - `GROQ_API_KEY`: Your actual API key

### Step 3: Get Your Render Backend URL

After deployment completes, you'll get a URL like: `https://codecure-api.onrender.com`

> **Note**: Free tier on Render: Service spins down after 15 mins of inactivity

---

## 7. Vercel Deployment Guide (Frontend + Optional Full App) ☁️

### Option A: Vercel Hosting Full App (Simple)

CodeCure is 100% production-ready for **Vercel**.

**Deployment Steps:**

1. **Ensure files are committed to GitHub**:

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)

3. Click **"Add New..."** → **"Project"**

4. Import your GitHub repository: `KGFCH2/CodeCure`

5. In **Environment Variables**, add:
   - `GROQ_API_KEY`: Your Groq API key
   - `RENDER_API_URL`: (only if using Render backend) e.g., `https://codecure-api.onrender.com`

6. Click **"Deploy"**

### Option B: Vercel Frontend + Render Backend (Recommended Production)

This setup separates concerns: Render handles heavy ML processing, Vercel hosts the lightweight frontend.

**Changes needed:**

Update your frontend `script.js` to call the Render backend API:

```javascript
// At the top of script.js, add:
const API_BASE_URL = window.ENV.RENDER_API_URL || 'http://localhost:8000';

// Update all API calls:
// OLD: const response = await fetch('/api/predict', {...})
// NEW: const response = await fetch(`${API_BASE_URL}/api/predict`, {...})
```

---

## 8. Connecting Render + Vercel 🔗

### Step 1: Configure Environment Variables

**On Render Dashboard** (codecure-api service):

```text
GROQ_API_KEY = your_groq_api_key
ALLOWED_ORIGINS = https://your-vercel-app.vercel.app
```

**On Vercel Dashboard**:

```text
GROQ_API_KEY = your_groq_api_key
RENDER_API_URL = https://codecure-api.onrender.com
```

### Step 2: Enable CORS in Render Backend

Update `main.py` to allow requests from Vercel:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "https://your-vercel-app.vercel.app",  # Your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 3: Update Frontend to Use Render Backend

**In `templates/index.html`**, pass the API URL:

```html
<script>
    window.ENV = {
        GROQ_API_KEY: "{{ groq_api_key }}",
        RENDER_API_URL: "{{ render_api_url }}"
    };
</script>
```

**In `main.py`**:

```python
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    render_api_url = os.getenv("RENDER_API_URL", "http://localhost:8000")
    return templates.TemplateResponse("index.html", {
        "request": request,
        "groq_api_key": groq_api_key,
        "render_api_url": render_api_url
    })
```

### Step 4: Update Frontend API Calls

**In `frontend/static/script.js`**, update all fetch calls:

```javascript
// Configure API base URL
const API_BASE_URL = window.ENV?.RENDER_API_URL || window.location.origin;

// Example: Update predict endpoint
async function submitPrediction() {
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    });
    return await response.json();
}

// Update other endpoints similarly:
// GET   ${API_BASE_URL}/api/health
// GET   ${API_BASE_URL}/api/dashboard
// GET   ${API_BASE_URL}/api/patients
// POST  ${API_BASE_URL}/api/predict
```

### Step 5: Database Configuration

**For Production Persistence:**

1. **On Render**: Create a PostgreSQL database
2. In Render Web Service settings, add:

   ```text
   DATABASE_URL = postgres://user:password@render-db-host/codecure
   ```

3. On Vercel: Add the same `DATABASE_URL` (or leave empty to use Render's DB)

---

## 9. Database Persistence Options

### Option 1: Using Vercel Postgres (Vercel-only deployment)

- **Uses**: Vercel Postgres service
- **Best for**: Vercel-only deployment
- **Setup**: Add in Vercel dashboard → Storage → Postgres
- **Connection**: Auto-detected via `POSTGRES_URL` environment variable

### Option 2: Using Render PostgreSQL (Render + Vercel deployment)

- **Uses**: Render PostgreSQL database
- **Best for**: Production with persistent storage
- **Setup**:
  1. In Render dashboard, create a PostgreSQL database
  2. Copy the connection string
  3. Add to both Render and Vercel as `DATABASE_URL` environment variable

### Option 3: LocalStorage Only (Development)

- **Uses**: Browser LocalStorage + `/tmp/codecure.db` on Vercel
- **Best for**: Testing, free tier
- **Limitations**: Data resets on server restart

---

## 10. Deployment Checklist ✅

### For Render Backend

- [ ] Create `render.yaml` in project root
- [ ] Add `GROQ_API_KEY` environment variable
- [ ] Set `ALLOWED_ORIGINS` to allow Vercel domain
- [ ] Enable CORS in `main.py`
- [ ] Deploy and get Render URL

### For Vercel Frontend

- [ ] Add `GROQ_API_KEY` environment variable
- [ ] Add `RENDER_API_URL` environment variable
- [ ] Update `script.js` to use `API_BASE_URL`
- [ ] Update `main.py` to pass `render_api_url`
- [ ] Update `templates/index.html` to inject API URL
- [ ] Deploy and verify connectivity

### Connection Testing

- [ ] Frontend loads without errors
- [ ] Health check API responds: `https://your-vercel-app.vercel.app/api/health`
- [ ] Predictions work with Render backend
- [ ] Dashboard loads and saves data (if using PostgreSQL)

---

## 11. ChemiBot Customization 🤖

ChemiBot uses `static/codecure_kb.json` as its knowledge base. To add more chemical/toxicology answers:

1. Open `static/codecure_kb.json`.
2. Add a new object with `keywords`, `question`, and `answer` related to toxicology, SMILES, molecular descriptors, or chemical properties.
3. The chatbot will instantly start recognizing the new keywords.

**Example**:

```json
{
  "keywords": ["SMILES", "structure", "notation"],
  "question": "What is SMILES notation?",
  "answer": "SMILES (Simplified Molecular Input Line Entry System) is a notation for representing molecules as text strings. For example, ethanol is CCO and benzene is c1ccccc1."
}
```

---

## 12. Troubleshooting 🔍

### General Issues

- **Blank PDFs**: Ensure you are using a Chromium-based browser (Chrome, Edge) for the best `html2pdf.js` results.
- **Model Errors**: If toxicity prediction fails, ensure you ran `python train_toxicity_model.py` and that the `model/` folder contains `.pkl` files (`toxicity_model.pkl`, `toxicity_scaler.pkl`, `toxicity_feature_names.pkl`).
- **Invalid SMILES**: The app validates SMILES notation via RDKit. Make sure your input follows valid SMILES rules. Example valid SMILES: `CCO` (ethanol), `CC(C)Cc1ccc(cc1)C(C)C` (ibuprofen).
- **Descriptor Calculation**: If molecular descriptors fail to calculate, check that RDKit is properly installed: `pip install -r requirements.txt`

### Deployment Issues

#### Render Backend Deployment

- **Build fails**: Check logs in Render dashboard. Ensure `train_toxicity_model.py` runs successfully
- **Service keeps spinning down**: Upgrade to paid tier to prevent idle spindown
- **API timeout**: Increase timeout in Render settings or optimize model prediction time

#### Vercel Frontend Deployment

- **Dashboard Resetting**: If compound data disappears on refresh, ensure your browser allows `LocalStorage`. For permanent storage, connect PostgreSQL
- **Can't reach Render backend**:
  - Check `RENDER_API_URL` environment variable in Vercel
  - Verify CORS is enabled in Render's `main.py`
  - Check browser console for CORS errors

#### Render + Vercel Connection

- **CORS errors**: Add your Vercel URL to `ALLOWED_ORIGINS` in Render's `main.py`

  ```python
  allow_origins=[
      "https://your-vercel-app.vercel.app",
      "https://your-domain.com",  # if using custom domain
  ]
  ```

- **API calls fail from Vercel**: Ensure `RENDER_API_URL` is set correctly in Vercel environment variables
- **Network errors**: Check if Render service is awake (might be spinning down on free tier)

#### Database Issues

- **Database connection fails on Render**: Verify `DATABASE_URL` is set correctly
- **Data not persisting**:
  - Check if using `/tmp/` database (ephemeral on Vercel)
  - Switch to PostgreSQL for production
- **Cross-service database access**: Ensure both Render and Vercel have same `DATABASE_URL` if sharing

---

**Happy Analyzing!** 🧪
