# ✅ COMPLETE SOLUTION: Real-ESRGAN Configuration

## 🎯 THE PROBLEM YOU REPORTED
"It is using by default the PIL processing, use the Real-ESRGAN by default and if tokens not available or any default in API connection then use fallback."

## ✅ SOLUTION IMPLEMENTED

### Where to Change Variables - Summary

You need to set your Hugging Face token **BEFORE starting the backend**. Here are all the places:

---

## 1️⃣ SET YOUR HF TOKEN (REQUIRED)

### Option A: PowerShell (EASIEST - Windows)
```powershell
# In PowerShell, run this command FIRST:
$env:HF_API_TOKEN = "your_actual_hf_token"

# Then start backend:
cd d:\iphone-glow-studio
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### Option B: .env.backend File
Edit: **`d:\iphone-glow-studio\.env.backend`**
```
HF_API_TOKEN=your_actual_hf_token
```

Then run PowerShell script:
```powershell
.\start_backend.ps1
```

This script automatically loads the token before starting backend.

### Option C: Linux/Mac
```bash
export HF_API_TOKEN="your_actual_hf_token"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

---

## 2️⃣ GET YOUR HUGGING FACE TOKEN

1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name (e.g., "RealESRGAN")
4. Select "Read" access level
5. Click "Create token"
6. Copy the token (starts with `hf_...`)

---

## 3️⃣ VERIFY IT'S WORKING

### In Backend Console, you should see:
```
✅ HF token found in environment variables
✅ Real-ESRGAN enhancement completed successfully via HF API
```

### In Browser Console (F12), you should see:
```
✅ Enhancement successful: {model: "huggingface", psnr_after: 28.45}
```

---

## 4️⃣ WHERE THE REAL-ESRGAN CODE IS

**File:** `backend/main.py`

### Line 173: Model Endpoint
```python
api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
```

### Line 176-180: Token Check
```python
hf_token = (
    os.getenv("HF_API_TOKEN") or 
    os.getenv("HUGGINGFACE_API_KEY") or 
    os.getenv("HF_TOKEN")
)
```

### Line 200-220: Real-ESRGAN Attempt
```python
for attempt in range(3):
    try:
        response = requests.post(
            api_url,  # ← Real-ESRGAN endpoint
            data=image_bytes,
            headers=headers,
            timeout=40,
        )
        if response.status_code == 200 and content_type.startswith("image"):
            return response.content, "huggingface", hf_debug  # ← SUCCESS!
```

### Line 230+: PIL Fallback (Only if Real-ESRGAN fails)
```python
# Only reached if Real-ESRGAN failed after 3 retries
logger.info("HF API unavailable — using PIL fallback")
pil_bytes = enhance_with_pil_fallback(image_bytes)
return pil_bytes, "pil", hf_debug  # ← Last resort
```

---

## 5️⃣ PRIORITY ORDER (What Changed)

### BEFORE (Wrong Priority):
1. ❌ Check if token exists
2. ❌ If NO → Use PIL immediately
3. ❌ If YES → Try HF

### AFTER (✅ Correct Priority):
1. ✅ Get HF token (from env vars)
2. ✅ TRY Real-ESRGAN API (3 attempts, 1 sec delays)
3. ✅ If HF fails → THEN use PIL as fallback

---

## 6️⃣ ALL CONFIGURATION VARIABLES

| Variable | File | Line | Purpose |
|----------|------|------|---------|
| `HF_API_TOKEN` | Environment | - | Your Hugging Face token |
| `api_url` | backend/main.py | 173 | Real-ESRGAN endpoint |
| `timeout` | backend/main.py | 204 | Request timeout seconds |
| `for attempt in range(3)` | backend/main.py | 202 | Number of retries |
| `port=8000` | backend/main.py | 445 | Backend port |
| `VITE_BACKEND_URL` | frontend/.env.production | - | Frontend backend URL |

---

## 7️⃣ TROUBLESHOOTING

### Q: "Still using PIL, not Real-ESRGAN?"
**A:** Check backend logs for `✅ HF token found`. If not there:
1. Token not set before backend started
2. Set token in SAME terminal where you run backend
3. Example: `$env:HF_API_TOKEN = "hf_..."; python -m uvicorn...`

### Q: "HF API returns 401?"
**A:** Token is invalid. Get a new one from https://huggingface.co/settings/tokens

### Q: "HF API returns 503?"
**A:** Model is overloaded. App will automatically fallback to PIL (slower but works).

### Q: "How do I know which model was used?"
**A:** Check:
- Backend logs: `Real-ESRGAN enhancement completed via HF API` or `using PIL fallback`
- Browser console: `model: "huggingface"` or `model: "pil"`
- Gallery PSNR: Only appears with Real-ESRGAN, not PIL

---

## 8️⃣ STEP-BY-STEP: MAKE IT WORK NOW

```powershell
# Step 1: Stop everything
taskkill /F /IM python.exe 2>$null

# Step 2: Set token (replace YOUR_TOKEN with actual token from HF)
$env:HF_API_TOKEN = "YOUR_TOKEN"

# Step 3: Start backend
cd d:\iphone-glow-studio
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info

# WATCH FOR:  ✅ HF token found in environment variables
# THEN WATCH FOR: ✅ Real-ESRGAN enhancement completed successfully via HF API
```

In another PowerShell:
```powershell
# Step 4: Start frontend
cd d:\iphone-glow-studio
npm run dev

# Step 5: Open browser
# http://localhost:5173
# → Capture page
# → Take photo
# → Enhance Photo
# → Check console (F12) for "model: huggingface"
```

---

## 9️⃣ PRODUCTION (Railway)

Set in Railway environment variables:
```
HF_API_TOKEN=your_real_hf_token
VITE_BACKEND_URL=https://your-railway-backend.up.railway.app
```

---

## 🔟 KEY FILES

- **Backend:** `backend/main.py` (lines 173-230)
- **Frontend:** `frontend/src/pages/Capture.tsx`
- **API Service:** `frontend/src/lib/services/realEsrganApi.ts`
- **Config:** `.env.backend`, `start_backend.ps1`, `CONFIGURATION_GUIDE.md`

---

## ✅ WHAT YOU NEED TO DO NOW

1. **Get HF token:** https://huggingface.co/settings/tokens
2. **Copy the token value** (starts with `hf_...`)
3. **Set it in PowerShell before starting backend:**
   ```powershell
   $env:HF_API_TOKEN = "paste_your_token_here"
   ```
4. **Start backend in same terminal:**
   ```powershell
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
   ```
5. **Verify logs show:** `✅ HF token found`
6. **Test Capture → Enhance → Check browser console for `model: "huggingface"`**

---

## 📋 SUMMARY OF CHANGES MADE

✅ Fixed HF token detection in `backend/main.py`
✅ Made Real-ESRGAN primary with PIL as fallback
✅ Added retry logic (3 attempts)  
✅ Fixed Capture component to use API service
✅ Added detailed logging on backend and frontend
✅ Created startup scripts for easy setup
✅ Committed to GitHub (commit: ca04423)

---

**The key takeaway:** Always set `HF_API_TOKEN` environment variable BEFORE starting the backend in the same terminal session. Everything else works automatically!
