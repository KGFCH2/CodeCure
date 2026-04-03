# CodeCure Deployment Guide: Render + Vercel

**Architecture:**

```
Frontend (Vercel) ↔ API (Render) ↔ GROQ API
```

**Free Tier Benefits:**

- ✅ Vercel: Unlimited deployments, auto-scaling, global CDN
- ✅ Render: 750 hours/month free, auto-sleep after 15 min inactivity
- ✅ GROQ: Free API with rate limits (perfect for demo)

---

## **Part 1: Deploy Backend to Render**

### **Step 1: Prepare Backend for Render**

Your `main.py` already works! Just verify `requirements.txt`:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-dotenv==1.0.0
scikit-learn>=1.3.0,<2.0
numpy
pandas
Jinja2
```

Create `Procfile` (Render uses this):

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### **Step 2: Push Code to GitHub**

```powershell
# Make sure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### **Step 3: Create Render Account**

1. Go to **<https://render.com>**
2. Sign up with GitHub
3. Authorize Render to access your GitHub repos

### **Step 4: Create Web Service on Render**

1. Dashboard → **New +** → **Web Service**
2. **Connect Repository** → Select `CodeCure`
3. Fill in details:
   - **Name:** `codecure-backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Click **Create Web Service**

### **Step 5: Add Environment Variables on Render**

1. In Render dashboard, go to your service
2. Click **Environment** tab
3. Add variable:

   ```
   GROQ_API_KEY = gsk_your_actual_api_key_here
   ```

4. **Save** and service will auto-redeploy

### **Step 6: Get Backend URL**

After deployment (2-5 minutes), you'll see:

```
Backend URL: https://codecure-backend-8yt5.onrender.com
```

**Copy this URL** - you'll need it for frontend.

---

## **Part 2: Deploy Frontend to Vercel**

### **Step 1: Update API Endpoint in Frontend**

Edit `static/script.js` (find the prediction function):

```javascript
// ╔════════════════════════════════════════╗
// ║ ADD THIS AT THE TOP OF script.js       ║
// ╚════════════════════════════════════════╝

// Get backend URL from environment or use default
const BACKEND_URL = window.ENV?.BACKEND_URL || 'https://codecure-backend-8yt5.onrender.com';

// Update handlePrediction function - change fetch endpoint:
async function handlePrediction(event) {
    event.preventDefault();
    // ... existing validation code ...

    // CHANGE THIS LINE:
    // FROM: const response = await fetch('/api/predict', {
    // TO:
    const response = await fetch(`${BACKEND_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionData)
    });
    
    // Rest of function stays the same...
}
```

### **Step 2: Update HTML to Pass Backend URL**

In `templates/index.html`, update the environment variable injection:

```html
<!-- Find this section (around line 876) -->
<script>
    window.ENV = {
        GROQ_API_KEY: "{{ groq_api_key }}",
        BACKEND_URL: "{{ backend_url }}"  // ← ADD THIS LINE
    };
</script>
<script src="/static/script.js"></script>
```

### **Step 3: Update Backend to Pass Backend URL to Frontend**

In `main.py`, modify the home route:

```python
@app.get("/", response_class=HTMLResponse)
async def root(request: Request, db: Session = Depends(get_db)):
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")  # ← ADD THIS
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "groq_api_key": groq_api_key,
        "backend_url": backend_url  # ← ADD THIS
    })
```

### **Step 4: Commit Changes**

```powershell
git add templates/index.html static/script.js main.py
git commit -m "Configure frontend for external backend API"
git push origin main
```

### **Step 5: Create Vercel Account**

1. Go to **<https://vercel.com>**
2. Sign up with GitHub
3. **Import Project** → Select `CodeCure`

### **Step 6: Configure Vercel Deployment**

1. **Project Settings:**
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: `.` (root)
   - Install Command: (leave empty)

2. **Environment Variables:**

   ```
   BACKEND_URL = https://codecure-backend-8yt5.onrender.com
   GROQ_API_KEY = gsk_your_api_key  (optional, already on Render)
   ```

3. Click **Deploy**

### **Step 7: Get Frontend URL**

After deployment, Vercel shows:

```
Frontend URL: https://your-project.vercel.app
```

---

## **Part 3: Test the Integration**

### **Test Backend**

```
GET https://codecure-backend-8yt5.onrender.com/
Expected: CodeCure homepage
```

### **Test Frontend**

```
GET https://your-project.vercel.app/
Expected: CodeCure homepage with working chatbot + predictions
```

### **Test API Connection**

1. Open Frontend: `https://your-project.vercel.app`
2. Fill prediction form
3. Click "Run AI Analysis"
4. Check Results section shows predictions
5. Open DevTools (F12) → Network tab
6. Verify requests go to `codecure-backend-8yt5.onrender.com/api/predict`

---

## **Part 4: Environment Variables Reference**

### **Render (Backend)**

| Variable | Value | Required |
|----------|-------|----------|
| `GROQ_API_KEY` | `gsk_xxx` | ✅ YES |
| `DATABASE_URL` | (not set - uses SQLite) | ❌ NO |

### **Vercel (Frontend)**

| Variable | Value | Required |
|----------|-------|----------|
| `BACKEND_URL` | `https://codecure-backend-8yt5.onrender.com` | ✅ YES |
| `GROQ_API_KEY` | (optional - already on Render) | ❌ NO |

### **Local Development (.env)**

```env
GROQ_API_KEY=gsk_your_key
BACKEND_URL=http://localhost:8000
```

---

## **Part 5: Custom Domain (Optional)**

### **Add Domain to Render**

1. Render Dashboard → Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. Update DNS records (Render provides instructions)

### **Add Domain to Vercel**

1. Vercel Dashboard → Settings → Domains
2. Add custom domain: `yourdomain.com`
3. Update DNS records (Vercel provides instructions)

---

## **Part 6: Troubleshooting**

### **Frontend can't reach backend**

**Problem:** CORS errors in console

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:** Add to `main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-project.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Backend returns 401 (API Key Error)**

**Problem:** GROQ_API_KEY not set on Render
**Solution:**

1. Render Dashboard → Environment → Check variable is set
2. Redeploy service: Click "Manual Deploy"

### **Render service goes to sleep**

**Info:** Free tier auto-sleeps after 15 min inactivity

- First request takes 10-30 seconds (cold start)
- Subsequent requests are fast
- Upgrade to paid tier if needed

---

## **Part 7: Monitoring & Updates**

### **View Backend Logs**

```
Render Dashboard → codecure-backend → Logs
```

### **View Frontend Logs**

```
Vercel Dashboard → CodeCure → Deployments → Logs
```

### **Update Backend**

```powershell
git push origin main
# Render auto-deploys in 1-2 minutes
```

### **Update Frontend**

```powershell
git push origin main
# Vercel auto-deploys in 1-2 minutes
```

---

## **Part 8: Performance Tips**

1. **Render:** Upgrade to paid tier if you exceed 750 hours/month
2. **Vercel:** Free tier is unlimited - no upgrades needed
3. **GROQ API:** Monitor your API usage at <https://console.groq.com/>

---

## **Summary Checklist**

- [ ] Render backend deployed
- [ ] Backend URL obtained: `https://codecure-backend-8yt5.onrender.com`
- [ ] GROQ_API_KEY set on Render
- [ ] Frontend code updated with backend URL
- [ ] Vercel frontend deployed
- [ ] Frontend URL obtained: `https://your-project.vercel.app`
- [ ] BACKEND_URL set on Vercel
- [ ] Tested: Form submission works
- [ ] Tested: Predictions return correctly
- [ ] Tested: Chatbot responds

---

## **Quick Commands Reference**

```powershell
# Deploy backend changes
git add main.py requirements.txt .
git commit -m "Backend updates"
git push origin main
# → Render auto-deploys

# Deploy frontend changes
git add templates/ static/
git commit -m "Frontend updates"
git push origin main
# → Vercel auto-deploys

# View local status
python main.py
# → http://localhost:8000

# Test backend API
curl https://codecure-backend-8yt5.onrender.com/api/health
# → Should return: {"status": "healthy"}
```

---

**You're all set for production deployment! 🚀**
