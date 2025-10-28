# 🎯 Where to Change Variables - Real-ESRGAN Configuration Guide

## 📍 QUICK START: Set Your HF Token

### Option 1: Using PowerShell (Windows) - RECOMMENDED
```powershell
# From project root (d:\iphone-glow-studio)
# Replace YOUR_HF_TOKEN with your actual Hugging Face token
$env:HF_API_TOKEN = "YOUR_HF_TOKEN"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### Option 2: Using .env.backend File (EASIEST)
Edit file: **`d:\iphone-glow-studio\.env.backend`**
```env
# Replace your_huggingface_token_here with your actual token
HF_API_TOKEN=your_huggingface_token_here
```

Then run the startup script:
```powershell
# Windows PowerShell
.\start_backend.ps1

# Or Linux/Mac
bash start_backend.sh
```

### Option 3: Direct in Code (NOT RECOMMENDED - Security Risk)
Edit file: **`d:\iphone-glow-studio\backend\main.py`** at line ~176

Find:
```python
hf_token = (
    os.getenv("HF_API_TOKEN") or 
    os.getenv("HUGGINGFACE_API_KEY") or 
    os.getenv("HF_TOKEN") or
    os.getenv("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")
)
```

Replace with:
```python
Replace with:
```python
hf_token = "YOUR_HF_TOKEN_HERE"  # Replace with your actual token (NOT SECURE!)
```
```

---

## 🔧 Key Configuration Variables

### 1. HuggingFace Token (.env.backend or environment)
**File:** `d:\iphone-glow-studio\.env.backend`
```env
HF_API_TOKEN=your_huggingface_token_here
```

**Also checked by backend at:** `backend/main.py` line 176-180
```python
hf_token = (
    os.getenv("HF_API_TOKEN") or 
    os.getenv("HUGGINGFACE_API_KEY") or 
    os.getenv("HF_TOKEN")
)
```

---

### 2. Real-ESRGAN Model Endpoint
**File:** `d:\iphone-glow-studio\backend\main.py` line 173
```python
api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
```

**Alternative Models:**
```python
# Option A: Qualcomm Real-ESRGAN (DEFAULT - RECOMMENDED)
api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"

# Option B: AI-Forever Real-ESRGAN
api_url = "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN"

# Option C: Upscayl API
api_url = "https://upscayl.tech/api"
```

---

### 3. Backend Server Config
**File:** `d:\iphone-glow-studio\backend\main.py` line 445
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",          # ← Change this to "127.0.0.1" for local only
        port=8000,               # ← Change this port number if needed
        log_level="info"         # ← Change to "debug" for verbose logging
    )
```

---

### 4. Frontend Backend URL
**File:** `d:\iphone-glow-studio\frontend\.env.production`
```env
VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app
```

**Local Dev:** Frontend defaults to `http://localhost:8000` if not set

---

### 5. PIL Fallback Settings
**File:** `d:\iphone-glow-studio\backend\main.py`

#### Upscaling Factor (line 74):
```python
new_size = (original_width * 2, original_height * 2)  # ← Change 2 to 4 for 4x upscale
```

#### Enhancement Strength (lines 75-80):
```python
enhancer = ImageEnhance.Sharpness(img)
img = enhancer.enhance(2.0)  # ← Increase for more sharpness (1.0 = no change)

enhancer = ImageEnhance.Contrast(img)
img = enhancer.enhance(1.3)  # ← Increase for more contrast

enhancer = ImageEnhance.Color(img)
img = enhancer.enhance(1.1)  # ← Increase for more saturation
```

---

### 6. PSNR Degradation Quality
**File:** `d:\iphone-glow-studio\backend\main.py` line 155
```python
degraded_bytes = degrade_image_jpeg(png_bytes, quality=50)  # ← Quality 0-100
```

Lower quality = more visible degradation = higher PSNR improvement

---

### 7. Request Timeout
**File:** `d:\iphone-glow-studio\backend\main.py` line 204
```python
response = requests.post(
    api_url,
    data=image_bytes,
    headers=headers,
    timeout=40,  # ← Change timeout seconds (increase for slow connections)
)
```

---

### 8. Retry Attempts
**File:** `d:\iphone-glow-studio\backend\main.py` line 202
```python
for attempt in range(3):  # ← Change 3 to higher number for more retries
```

---

## 🚀 STEP-BY-STEP: Fix "Not Using Real-ESRGAN"

### Step 1: Set Your Token
```powershell
# Windows PowerShell - Run this FIRST
# Replace YOUR_HF_TOKEN with your actual Hugging Face token
$env:HF_API_TOKEN = "YOUR_HF_TOKEN"
```

### Step 2: Start Backend (With Token)
```powershell
cd d:\iphone-glow-studio
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### Step 3: Verify Token is Loaded
Backend console should show:
```
✅ HF token found in environment variables
✅ Real-ESRGAN enhancement completed successfully via HF API
```

### Step 4: Test Enhancement
```powershell
# In another PowerShell window, test the backend health
Invoke-WebRequest -Uri "http://localhost:8000/health"
```

Should return:
```json
{
  "status": "ok",
  "model": "Real-ESRGAN (Hugging Face with PIL Fallback)",
  "scale": 4,
  "upscaling": "4x upscaling via Real-ESRGAN"
}
```

### Step 5: Start Frontend
```powershell
npm run dev
```

### Step 6: Test Capture
1. Open http://localhost:5173
2. Go to Capture page
3. Take a photo
4. Click "Enhance Photo"
5. Check browser console (F12) for logs

Expected output:
```
🚀 Enhancement started. Backend URL: http://localhost:8000
📞 Calling enhanceImageWithRealESRGAN service...
✅ Enhancement successful: {model: "huggingface", psnr_after: 28.45}
```

---

## 🔍 Debugging: "Still Using PIL?"

### Check These:

1. **Backend logs show token?**
   ```
   ✅ HF token found  ← Should see this
   ```
   If not, token not set properly.

2. **HF API response status?**
   Look for in backend console:
   ```
   HF API attempt 1: status=200, content-type=image/png ← Good
   OR
   HF API attempt 1: status=503, content-type=application/json ← Model overloaded
   OR
   HF API attempt 1: status=401 ← Invalid token
   ```

3. **Using PIL fallback?**
   ```
   HF API unavailable/failed after retries — using PIL fallback
   ```
   This means HF genuinely failed (check token, internet, HF API status)

---

## 📋 Environment Variable Names (Checked in Order)

The backend checks these in this order:
1. ✅ `HF_API_TOKEN` (RECOMMENDED)
2. ✅ `HUGGINGFACE_API_KEY`
3. ✅ `HF_TOKEN`
4. ✅ `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` (Your specific token env var name)

**Set at least ONE of these.**

---

## 🎯 Production Deployment (Railway)

In Railway dashboard, set environment variables:
```
HF_API_TOKEN=your_huggingface_token_here
VITE_BACKEND_URL=https://your-railway-backend-url.up.railway.app
```

---

## ✅ Quick Checklist

- [ ] Set `HF_API_TOKEN=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` before starting backend
- [ ] Backend console shows "✅ HF token found"
- [ ] Backend console shows "✅ Real-ESRGAN enhancement completed via HF API"
- [ ] Browser console shows model_used: "huggingface"
- [ ] Gallery shows PSNR metrics (only happens with Real-ESRGAN, not PIL)

---

## 📞 Files to Check

| File | Purpose | Line |
|------|---------|------|
| `.env.backend` | Store HF token locally | - |
| `backend/main.py` | Main backend code | 173-180 |
| `backend/main.py` | Token checking | 176-182 |
| `backend/main.py` | API endpoint | 295 |
| `frontend/.env.production` | Backend URL | - |
| `start_backend.ps1` | Windows startup script | - |
| `start_backend.sh` | Linux/Mac startup script | - |

---

## 🎓 Understanding the Flow

```
User captures photo
    ↓
Frontend calls /api/enhance
    ↓
Backend receives image
    ↓
Backend checks: Do I have HF_API_TOKEN? ← THIS IS THE KEY CHECK
    ├─ YES → Try Real-ESRGAN API (3 attempts)
    │   ├─ Success → Return enhanced image (model_used: "huggingface")
    │   └─ Fail → Try PIL fallback (model_used: "pil")
    └─ NO → Use PIL fallback immediately (model_used: "pil")
    ↓
Return image + PSNR metrics + model info
    ↓
Frontend displays enhanced image
```

The key is: **HF token must be set BEFORE backend starts.**

---

## 🆘 If Still Not Working

1. **Stop all Python processes:**
   ```powershell
   taskkill /F /IM python.exe
   ```

2. **Set token explicitly:**
   ```powershell
   $env:HF_API_TOKEN = "YOUR_HF_TOKEN"
   ```

3. **Verify it's set:**
   ```powershell
   echo $env:HF_API_TOKEN  # Should print your token (but keep it secret!)
   ```

4. **Start backend:**
   ```powershell
   cd d:\iphone-glow-studio
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
   ```

5. **Check first log line:**
   Backend should immediately log: `✅ HF token found in environment variables`

If this doesn't appear, the token wasn't passed to Python process.

---

**Remember: The token must be set in the SAME terminal session where you start the backend!**
