# 🎯 Configuration Guide - Real-ESRGAN Setup

## 📍 QUICK START: Set Your HF Token

### Option 1: Using PowerShell (Windows) - RECOMMENDED
```powershell
# From project root
$env:HF_API_TOKEN = "your_token_here"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### Option 2: Using .env.backend File
Edit: `d:\iphone-glow-studio\.env.backend`
```
HF_API_TOKEN=your_token_here
```

Then run:
```powershell
.\start_backend.ps1
```

---

## 🔧 Key Configuration Variables

### 1. Hugging Face Token
Set via environment variable or `.env.backend` file

Backend checks in order:
- `HF_API_TOKEN` (RECOMMENDED)
- `HUGGINGFACE_API_KEY`
- `HF_TOKEN`

**Get your token:**
1. Go to https://huggingface.co/settings/tokens
2. Create new token with "Read" access
3. Set `$env:HF_API_TOKEN = "token_value"`

### 2. Real-ESRGAN Model Endpoint
File: `backend/main.py` line 173

Default (recommended):
```python
api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
```

Alternative:
```python
# AI-Forever model
api_url = "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN"
```

### 3. Backend Port
File: `backend/main.py` line 445
```python
port=8000  # Change this for different port
```

### 4. Frontend Backend URL
File: `frontend/.env.production`
```
VITE_BACKEND_URL=https://your-backend-url.com
```

Local default: `http://localhost:8000`

### 5. Retry Attempts
File: `backend/main.py` line 202
```python
for attempt in range(3):  # Increase for more retries
```

### 6. Request Timeout
File: `backend/main.py` line 204
```python
timeout=40,  # Seconds (increase for slow connections)
```

---

## 🚀 STEP-BY-STEP: Make Real-ESRGAN Work

### Step 1: Get HF Token
- Visit https://huggingface.co/settings/tokens
- Create new token → Copy it

### Step 2: Set Token
```powershell
$env:HF_API_TOKEN = "your_copied_token"
```

### Step 3: Start Backend
```powershell
cd d:\iphone-glow-studio
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### Step 4: Check Logs
Should see: `✅ HF token found in environment variables`

### Step 5: Start Frontend
```powershell
npm run dev
```

### Step 6: Test
1. Open http://localhost:5173
2. Capture page → Take photo
3. Click "Enhance Photo"
4. Check console (F12) for success

---

## 🔍 Troubleshooting

### "Still using PIL fallback?"

1. Check backend logs for token message
2. Verify token is set: `echo $env:HF_API_TOKEN`
3. Check HF API status page
4. Try different token (old one might be expired)

### "HF API returns 401?"

Token is invalid or expired. Get a new one.

### "HF API returns 503?"

Model is overloaded. Retry later or use PIL fallback (slower but works).

---

## 📋 Environment Variables

```powershell
# Set ONE of these:
$env:HF_API_TOKEN = "your_token"
$env:HUGGINGFACE_API_KEY = "your_token"
$env:HF_TOKEN = "your_token"
```

---

## 🎯 Production (Railway)

Set in Railway dashboard:
```
HF_API_TOKEN=your_token_here
VITE_BACKEND_URL=https://your-railway-backend.up.railway.app
```

---

**Remember: Token must be set BEFORE starting backend in the same terminal!**
