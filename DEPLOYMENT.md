# 🚀 CodeCure Deployment Reference Guide

Quick reference for deploying CodeCure on Render + Vercel with step-by-step instructions and environment variable checklists.

---

## ⚡ TL;DR - Absolute Minimum Setup

**Want the simplest possible deployment?** You only need:

1. **GROQ_API_KEY** from [groq.com](https://groq.com) (for ChemiBot)
2. Deploy frontend to Vercel (→ Option 1 or Option 2)
3. **That's it!** No database needed. Predictions stay in your browser.

**Want persistent storage across devices?**

- Add Render backend (→ Option 2 for full setup with optional database)
- Database (`DATABASE_URL`) is **completely optional** even for production

---

## Quick Start Comparison

| Aspect | LocalStorage Only | Vercel Only | Render + Vercel |
| -------- | ------------------- | ------------- | ----------------- |
| **Complexity** | Ultra Simple ⭐ | Simple ⭐⭐ | Moderate ⭐⭐⭐ |
| **Best For** | Testing, learning | Prototyping | Production |
| **Data Storage** | Browser only | `/tmp` or Postgres | PostgreSQL |
| **Persistence** | Until browser cleared | Per-session or DB | Cross-device |
| **Multi-user** | Single device | Single device | Multiple users |
| **Setup Time** | 5 min | 10 min | 20 min |
| **Cost** | Free | Free | Free |
| **Database Required** | ❌ NO | ❌ NO | ✅ Optional |

---

## Option 0: LocalStorage Only (Simplest - NO DATABASE NEEDED) 🟢⭐

### What is LocalStorage?

Browser's built-in storage that persists data **locally on your device**. No server database needed!

### ✅ Pros

- **Zero database setup** - completely skip PostgreSQL
- **Instant deployment** - no configuration needed
- **Free forever** - no database costs
- **Fast** - no network latency for data
- **Privacy-friendly** - data stays on your device
- **Perfect for**: Testing, learning, personal use, demos

### ❌ Cons

- **Single device** - data doesn't sync across devices
- **Browser-specific** - different browsers have separate storage
- **Cleared on data wipe** - clearing browser cache loses data
- **Not shared** - can't share data with other users
- **Size limit** - ~5-10 MB per domain

### How It Works

1. User enters SMILES and submits toxicity prediction
2. Backend analyzes and returns results
3. **Frontend stores results in browser's LocalStorage** ✓
4. Data persists even after page refresh ✓
5. User can view/export history from LocalStorage ✓

### Step-by-Step Deployment (LocalStorage Only)

#### Step 1: Deploy Backend (Minimal Setup)

- **Vercel**: Deploy as usual (backend handles predictions)
- **Render**: Deploy as usual (backend handles predictions)
- **No database needed** ❌ Skip PostgreSQL setup

#### Step 2: That's It! 🎉

The app automatically uses LocalStorage for results. No additional configuration needed.

#### Configuration (Optional)

If backend has database URL set, it will use it. If not set, LocalStorage is used automatically.

In `main.py`:

```python
# Database is optional - app works fine without it
DATABASE_URL = os.environ.get('POSTGRES_URL') or os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # Use PostgreSQL if available
    engine = create_engine(DATABASE_URL)
else:
    # Use LocalStorage (frontend handles it)
    # Backend returns results, frontend stores them
    pass
```

#### Testing LocalStorage

1. Deploy and access your app
2. Open Browser DevTools (F12) → Application → Local Storage
3. Submit a toxicity prediction
4. Check Local Storage - data will be there ✓
5. Refresh page - data persists ✓
6. Clear browser cache - data clears (expected)

### LocalStorage Data Structure

```javascript
// What gets stored in browser
localStorage.setItem('codecure_compounds', JSON.stringify([
    {
        id: 1,
        smiles: "CCO",
        toxicity_score: 25,
        risk_level: "Low",
        timestamp: "2026-04-03"
    },
    {
        id: 2,
        smiles: "CC(C)Cc1ccc(cc1)C(C)C",
        toxicity_score: 42,
        risk_level: "Medium",
        timestamp: "2026-04-03"
    }
]));
```

### When to Use LocalStorage Only

✅ Use if:

- Solo project/personal use
- Learning and testing
- Demo/prototype
- Don't need multi-device sync
- Want zero database complexity

❌ Don't use if:

- Multiple users
- Need persistent shared data
- Production with high importance
- Need data across devices/browsers

---

## Option 1: Vercel Only (Recommended for Quick Start) 🟢

### Prerequisites

- GitHub account with CodeCure repository
- Vercel account (free at vercel.com)
- Groq API key

### Step-by-Step

#### 1. Prepare Repository

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

#### 2. Create Vercel Project

1. Go to <https://vercel.com/dashboard>
2. Click **"Add New"** → **"Project"**
3. Select **CodeCure** repository
4. Click **"Import"**

#### 3. Configure Environment Variables

In Vercel project settings, add:

| Key | Value | Example |
|-----|-------|---------|
| `GROQ_API_KEY` | Your Groq API key | `gsk_xxxxxxxxxxxxx` |
| `POSTGRES_URL` | (Optional) Vercel Postgres | `postgres://user:pass@host/db` |

#### 4. Deploy

- Click **"Deploy"**
- Wait for build to complete (~2-3 minutes)
- Your app will be live at `https://your-app-name.vercel.app`

#### 5. Test

- Visit your Vercel URL
- Go to `/api/health` to verify backend is working
- Try a toxicity prediction

---

## Option 2: Render Backend + Vercel Frontend (Production) 🟠

### Prerequisites

- GitHub account with CodeCure repository
- Render account (free at render.com)
- Vercel account (free at vercel.com)
- Groq API key
- (Optional) PostgreSQL database

### Step A: Deploy Backend on Render

#### 1. Prepare Repository

```bash
# Ensure render.yaml is in project root (already included)
git add render.yaml
git commit -m "Add Render configuration"
git push origin main
```

#### 2. Create Render Web Service

1. Go to <https://dashboard.render.com>
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. In settings, use these values:
   - **Name**: `codecure-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python train_toxicity_model.py`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8080`
   - **Plan**: Free (or paid for production)

#### 3. Add Environment Variables on Render

After service is created, go to **Settings** → **Environment**:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your actual API key |
| `DATABASE_URL` | (Optional) PostgreSQL URL |
| `ALLOWED_ORIGINS` | Leave empty for now (update after Vercel deployment) |

#### 4. Note Your Render URL

After deployment, get URL like: `https://codecure-api.onrender.com`

**Template**: `https://codecure-api.onrender.com`

---

### Step B: Update Code for Render + Vercel Integration

#### 1. Update `main.py` - Add CORS middleware

Add at the top after imports:

```python
from fastapi.middleware.cors import CORSMiddleware
import os
```

Add after `app = FastAPI(...)`:

```python
# Allow CORS for Vercel frontend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 2. Update `main.py` - Pass Render URL to Frontend

Find the `@app.get("/")` endpoint and update:

```python
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    render_api_url = os.getenv("RENDER_API_URL", request.url.hostname)
    return templates.TemplateResponse("index.html", {
        "request": request,
        "groq_api_key": groq_api_key,
        "render_api_url": render_api_url
    })
```

#### 3. Update `templates/index.html` - Inject Render URL

Find the script tag where environment is set:

```html
<script>
    window.ENV = {
        GROQ_API_KEY: "{{ groq_api_key }}",
        RENDER_API_URL: "{{ render_api_url }}"
    };
</script>
```

#### 4. Update `frontend/static/script.js` - Use Render API

Add at the top of the file:

```javascript
// Get API base URL from environment or Vercel
const API_BASE_URL = window.ENV?.RENDER_API_URL || window.location.origin;
```

Find all fetch calls and update them. Examples:

**Before**:

```javascript
const response = await fetch('/api/predict', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
});
```

**After**:

```javascript
const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
});
```

**Update all endpoints**:

- `${API_BASE_URL}/api/health`
- `${API_BASE_URL}/api/predict`
- `${API_BASE_URL}/api/dashboard`
- `${API_BASE_URL}/api/patients`

#### 5. Commit Changes

```bash
git add main.py templates/index.html frontend/static/script.js
git commit -m "Add Render + Vercel integration"
git push origin main
```

---

### Step C: Deploy Frontend on Vercel

#### 1. Create Vercel Project

1. Go to <https://vercel.com/dashboard>
2. Click **"Add New"** → **"Project"**
3. Select **CodeCure** repository
4. Click **"Import"**

#### 2. Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Key | Value | Where to Get |
|-----|-------|--------------|
| `GROQ_API_KEY` | Your Groq API key | [Groq Console](https://console.groq.com/keys) |
| `RENDER_API_URL` | Your Render URL | Render dashboard (from Step A.4) |

**Example**:

```
GROQ_API_KEY = gsk_xxxxxxxxxxxxxxxx
RENDER_API_URL = https://codecure-api.onrender.com
```

#### 3. Deploy

Click **"Deploy"** and wait for completion

Your Vercel URL: `https://codecure-frontend.vercel.app`

---

### Step D: Connect Render + Vercel

#### 1. Update Render Environment Variables

Go back to Render dashboard → codecure-api service → Settings

Update `ALLOWED_ORIGINS`:

```
https://codecure-frontend.vercel.app,https://your-custom-domain.com
```

Click **"Save Changes"** - service will redeploy

#### 2. Verify Connection

- Visit your Vercel URL
- Open browser DevTools (F12)
- Go to Console tab
- Submit a toxicity prediction
- Should see API calls to `https://codecure-api.onrender.com/api/predict`

---

## Environment Variables Checklist

### Required (All Options)

- [ ] `GROQ_API_KEY`: Your Groq API key (for ChemiBot)

### Optional (For Database - Completely Skip if Using LocalStorage)

- [ ] `DATABASE_URL`: PostgreSQL connection string
  - **NOT NEEDED FOR LOCALSTORAGE** ✓
  - Only set if you want server-side persistent storage

### Render Backend

- [ ] `GROQ_API_KEY`: Set and verified
- [ ] `DATABASE_URL`: **(OPTIONAL)** Leave blank for LocalStorage-only
- [ ] `ALLOWED_ORIGINS`: Set to your Vercel domain (if using Render + Vercel)
- [ ] `PORT`: 8080 (auto-set by Render)

### Vercel Frontend

- [ ] `GROQ_API_KEY`: Same as Render
- [ ] `RENDER_API_URL`: Render backend URL (only for Render + Vercel setup)
- [ ] `DATABASE_URL`: **(OPTIONAL)** Leave blank for LocalStorage-only

### Database (Optional PostgreSQL - Skip This If Using LocalStorage)

- [ ] Create PostgreSQL database (on Render or external provider)
- [ ] Set `DATABASE_URL` on both Render and Vercel
- [ ] Verify connection in app

---

## Testing Your Deployment

### Health Check

```bash
# Vercel
curl https://your-vercel-app.vercel.app/api/health

# Render (if deployed as full app)
https://codecure-api.onrender.com/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "database_status": "connected",
  "version": "1.0.0"
}
```

### Toxicity Prediction Test

1. Visit your Vercel app: `https://your-vercel-app.vercel.app`
2. Input a SMILES string (e.g., `CCO` for ethanol)
3. Click "Predict"
4. Should return toxicity score and risk factors

### Browser Console Test

```javascript
// In browser console, check environment:
console.log(window.ENV.RENDER_API_URL);
// Should print: https://codecure-api.onrender.com
```

---

## Troubleshooting Deployment

### Render Issues

**Build fails**:

- Check Render build logs
- Ensure `python train_toxicity_model.py` succeeds
- Verify all requirements are in `requirements.txt`

**Service sleeping**:

- Free tier sleeps after 15 min of inactivity
- Upgrade to paid tier to prevent: Settings → Plan
- Or use health check to keep alive

### Vercel Issues

**Can't reach Render backend**:

- Check `RENDER_API_URL` environment variable
- Verify CORS enabled in Render's `main.py`
- Check browser console for CORS error messages

**Data not saving**:

- Using LocalStorage only (needs PostgreSQL for persistence)
- Check database connection (`DATABASE_URL` set?)

### Connection Issues

**CORS errors**:

```
Access to fetch at 'https://codecure-api.onrender.com/api/predict' 
from origin 'https://your-vercel-app.vercel.app' has been blocked by CORS policy
```

**Solution**: Update `ALLOWED_ORIGINS` on Render to include Vercel URL

**API calls timeout**:

- Render service might be spinning down
- Try again (will wake up)
- Or upgrade to paid tier

---

## Custom Domain Setup

### For Render Backend

1. Render dashboard → codecure-api → Settings → Custom Domain
2. Add domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed
4. Update Vercel `RENDER_API_URL` to use custom domain

### For Vercel Frontend

1. Vercel dashboard → Settings → Domains
2. Add domain (e.g., `yourdomain.com`)
3. Update DNS records as instructed

---

## Cost Summary (Free Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Render** | 750 hrs/month | Sleeps after 15 min |
| **Vercel** | Unlimited | Redeployment on git push |
| **Vercel Postgres** | None | Need to pay |
| **Render PostgreSQL** | None | Need to pay |

**Recommendation**: Start with free tier, upgrade as traffic grows.

---

## Next Steps

1. ✅ Choose deployment option (Vercel only or Render + Vercel)
2. ✅ Follow step-by-step guide above
3. ✅ Set environment variables
4. ✅ Deploy and test
5. ✅ Monitor performance in dashboards

**Questions?** Check [troubleshooting section](#troubleshooting-deployment) or Render/Vercel docs.

---

**Happy Analyzing!** 🧪🚀
