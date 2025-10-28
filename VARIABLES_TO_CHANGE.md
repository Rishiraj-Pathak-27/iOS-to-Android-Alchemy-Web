# 📍 EXACT PLACES TO CHANGE VARIABLES

## 1. SET YOUR HUGGING FACE TOKEN
**When:** BEFORE you start the backend
**Where:** PowerShell terminal

```powershell
# Replace YOUR_ACTUAL_TOKEN with real token from HF
$env:HF_API_TOKEN = "YOUR_ACTUAL_TOKEN"

# Then start backend:
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

---

## 2. Real-ESRGAN MODEL ENDPOINT
**File:** `d:\iphone-glow-studio\backend\main.py`
**Line:** 173

Current (Qualcomm - RECOMMENDED):
```python
api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
```

Alternative (AI-Forever):
```python
api_url = "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN"
```

---

## 3. HF TOKEN ENVIRONMENT VARIABLE CHECK
**File:** `d:\iphone-glow-studio\backend\main.py`
**Lines:** 176-180

```python
hf_token = (
    os.getenv("HF_API_TOKEN") or              # ← Checks this first
    os.getenv("HUGGINGFACE_API_KEY") or       # ← Then this
    os.getenv("HF_TOKEN")                     # ← Then this
)
```

Backend checks these in order. Set ANY ONE of them:
```powershell
$env:HF_API_TOKEN = "token"
# OR
$env:HUGGINGFACE_API_KEY = "token"
# OR
$env:HF_TOKEN = "token"
```

---

## 4. RETRY ATTEMPTS
**File:** `d:\iphone-glow-studio\backend\main.py`
**Line:** 202

```python
for attempt in range(3):  # ← Change 3 to higher number for more retries
```

---

## 5. REQUEST TIMEOUT (seconds)
**File:** `d:\iphone-glow-studio\backend\main.py`
**Line:** 204

```python
response = requests.post(
    api_url,
    data=image_bytes,
    headers=headers,
    timeout=40,  # ← Increase this for slow connections
)
```

---

## 6. BACKEND PORT
**File:** `d:\iphone-glow-studio\backend\main.py`
**Line:** 445

```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,    # ← Change this if needed
        log_level="info"
    )
```

---

## 7. FRONTEND BACKEND URL (Production)
**File:** `d:\iphone-glow-studio\frontend\.env.production`

```env
VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app
```

Local dev default: `http://localhost:8000` (if VITE_BACKEND_URL not set)

---

## 8. CAPTURE COMPONENT (Frontend)
**File:** `d:\iphone-glow-studio\frontend\src\pages\Capture.tsx`
**Function:** `enhanceImage()` uses the API service automatically

No changes needed - it's already configured to use the backend correctly!

---

## PRIORITY FLOW (The Fix)

### Code Flow in `backend/main.py`:

```
User uploads image to /api/enhance
    ↓
Line 176-180: Check for HF_API_TOKEN
    ↓
Line 173: Set api_url to Real-ESRGAN endpoint
    ↓
Line 202-220: TRY Real-ESRGAN (3 attempts)
    ├─ Success ✅ → Return enhanced image (model: "huggingface")
    └─ Fail ❌ → Continue to PIL
    ↓
Line 230+: Use PIL fallback (model: "pil")
    ↓
Return response to frontend
```

---

## ENVIRONMENT VARIABLES YOU SHOULD SET

| Var Name | Value | Where | Use |
|----------|-------|-------|-----|
| `HF_API_TOKEN` | your_hf_token | PowerShell before backend | Real-ESRGAN auth |
| `VITE_BACKEND_URL` | http://localhost:8000 | frontend/.env.production | Frontend knows where backend is |

---

## FILE LOCATIONS SUMMARY

```
d:\iphone-glow-studio\
├── backend\main.py                    ← Real-ESRGAN logic (lines 173-230)
├── frontend\
│   ├── .env.production               ← Backend URL for production
│   ├── src\pages\Capture.tsx        ← Camera capture (already fixed)
│   └── src\lib\services\realEsrganApi.ts  ← API service (already fixed)
├── .env.backend                      ← Put your HF token here (optional)
├── start_backend.ps1                 ← Run this (loads .env.backend + starts backend)
├── start_backend.sh                  ← Run this on Linux/Mac
└── SETUP_INSTRUCTIONS.md             ← Full setup guide
```

---

## QUICK TEST

```powershell
# 1. Set token
$env:HF_API_TOKEN = "hf_..."

# 2. Start backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info

# 3. In browser console, capture a photo and enhance it

# 4. Check for these logs:
# Backend: "✅ Real-ESRGAN enhancement completed successfully via HF API"
# Browser: "✅ Enhancement successful: {model: "huggingface", ...}"
```

If you see these logs → **Real-ESRGAN is being used!** ✅

---

## MOST IMPORTANT

⚠️ **THE TOKEN MUST BE SET IN THE SAME TERMINAL SESSION BEFORE STARTING BACKEND**

❌ Wrong:
```powershell
# Terminal 1
$env:HF_API_TOKEN = "token"
# Close terminal

# Terminal 2 (NEW - token lost!)
python -m uvicorn...  # ← Won't have token!
```

✅ Correct:
```powershell
# Terminal 1
$env:HF_API_TOKEN = "token"
python -m uvicorn...  # ← Same terminal, token available!
```

Or use `.env.backend` file + `start_backend.ps1` script (handles this automatically).
