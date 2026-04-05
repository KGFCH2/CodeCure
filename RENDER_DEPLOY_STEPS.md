# 🚀 CodeCure Render Deployment Guide

Follow these steps to deploy CodeCure as a single application on Render. This method serves both the frontend and backend from the same server.

## 1. Prepare Your Repository

Ensure all changes are pushed to your GitHub/GitLab repository:

```bash
git add .
git commit -m "Configure for single-host Render deployment"
git push origin main
```

## 2. Create Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your repository.
4. Fill in the following settings:
   - **Name:** `codecure` (or your preferred name)
   - **Region:** Choose the one closest to you (e.g., Singapore or Oregon)
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python train_model.py`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 3. Configure Environment Variables

In the **Environment** tab of your Render service, add:

- `GROQ_API_KEY`: Your Groq API key (required for chatbot).
- `DATABASE_URL`: (Optional) Use a Postgres URL if you want a persistent database. If not set, it will use a local SQLite file (reset on every deploy).
- `PYTHON_VERSION`: `3.11.0` (Recommended)

## 4. Deploy

1. Click **Create Web Service**.
2. Wait for the build and deployment (takes 2-5 minutes).
3. Once **Live**, click the URL provided by Render (e.g., `https://codecure.onrender.com`).

## 5. Troubleshooting

- **CORS Errors:** The app is configured to allow all origins, so you shouldn't see these.
- **Model Load Errors:** Ensure `train_model.py` runs successfully during the build step.
- **Chatbot Silent:** Ensure the `GROQ_API_KEY` is correctly added to Environment Variables.
