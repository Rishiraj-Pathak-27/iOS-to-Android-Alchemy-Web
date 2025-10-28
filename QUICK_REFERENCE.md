# 🎯 QUICK REFERENCE CARD

## WHERE TO CHANGE VARIABLES (Visual Guide)

```
YOUR HF TOKEN
     ↓
SET BEFORE BACKEND STARTS
     ↓
$env:HF_API_TOKEN = "hf_YOUR_TOKEN_HERE"
     ↓
python -m uvicorn backend.main:app ...
     ↓
     ↓
┌─────────────────────────────────────┐
│  backend/main.py (THE LOGIC)        │
│                                     │
│  Line 176-180: Check Token          │
│  ┌────────────────────────────────┐ │
│  │ hf_token = (                   │ │
│  │   os.getenv("HF_API_TOKEN")    │ │ ← This should have your token
│  │   or os.getenv("...")          │ │
│  │   or os.getenv("...")          │ │
│  │ )                              │ │
│  └────────────────────────────────┘ │
│                                     │
│  Line 173: Real-ESRGAN Endpoint     │
│  ┌────────────────────────────────┐ │
│  │ api_url = "...qualcomm/...x4"  │ │ ← Primary endpoint
│  └────────────────────────────────┘ │
│                                     │
│  Line 202-230: Try Real-ESRGAN      │
│  ┌────────────────────────────────┐ │
│  │ for attempt in range(3):       │ │ ← 3 retries
│  │   response = requests.post(    │ │
│  │     api_url, ...               │ │
│  │     timeout=40                 │ │ ← 40 second timeout
│  │   )                            │ │
│  │   if success:                  │ │
│  │     return enhanced, "hf", ... │ │ ✅ SUCCESS
│  └────────────────────────────────┘ │
│                                     │
│  Line 230+: PIL Fallback            │
│  ┌────────────────────────────────┐ │
│  │ pil_bytes = enhance_with_PIL() │ │ ⏸️  Only if Real-ESRGAN fails
│  │ return pil_bytes, "pil", ...   │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
     ↓
RETURNS TO FRONTEND
     ↓
┌─────────────────────────────────────┐
│  frontend/src/pages/Capture.tsx     │
│                                     │
│  enhanceImage() function            │
│  ↓                                  │
│  Calls: enhanceImageWithRealESRGAN()│
│  ↓                                  │
│  Backend URL from env:              │
│  VITE_BACKEND_URL (production)      │
│  or localhost:8000 (dev)            │
│  ↓                                  │
│  Displays result + PSNR metrics     │
│                                     │
└─────────────────────────────────────┘
```

---

## PRIORITY FLOW (The Fix)

```
REAL-ESRGAN ← PRIMARY (TRY FIRST)
    ↓
SUCCESS ✅ → USE IT
    ↓
FAIL ❌ → RETRY (3 times)
    ↓
ALL FAIL ❌ → FALLBACK TO PIL ← SECONDARY
```

---

## FILES TO KNOW

```
d:\iphone-glow-studio\
│
├── 📄 README_FIXES.md               ← THIS (summary of everything)
├── 📄 VARIABLES_TO_CHANGE.md        ← WHERE TO CHANGE SETTINGS
├── 📄 SETUP_INSTRUCTIONS.md         ← HOW TO SET UP
├── 📄 CONFIGURATION_GUIDE.md        ← CONFIG REFERENCE
│
├── 🐍 backend\main.py               ← REAL-ESRGAN LOGIC
│   ├── Line 173: Model endpoint
│   ├── Line 176-180: Token check
│   ├── Line 202-230: Try Real-ESRGAN
│   └── Line 230+: PIL fallback
│
├── ⚙️ frontend\src\pages\Capture.tsx ← CAMERA CAPTURE
│   └── enhanceImage() → calls API service
│
├── 🔌 .env.backend                  ← YOUR TOKEN (git ignored)
├── 🔧 start_backend.ps1             ← EASY START (Windows)
└── 🔧 start_backend.sh              ← EASY START (Linux/Mac)
```

---

## CONFIGURATION CHECKLIST

- [ ] **Token** → `$env:HF_API_TOKEN = "hf_..."`
- [ ] **Endpoint** → backend/main.py:173 (already set to Real-ESRGAN)
- [ ] **Retries** → backend/main.py:202 (already set to 3)
- [ ] **Timeout** → backend/main.py:204 (already set to 40s)
- [ ] **Frontend URL** → frontend/.env.production (already set)
- [ ] **Capture** → frontend/src/pages/Capture.tsx (already uses API service)

---

## COMMAND QUICK COPY

### Set Token & Start Backend
```powershell
$env:HF_API_TOKEN = "hf_YOUR_TOKEN_FROM_HUGGINGFACE"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### Start Frontend (New Terminal)
```powershell
npm run dev
```

### Test in Browser
- Open: http://localhost:5173
- Go to: Capture page
- Action: Take photo → Enhance Photo
- Check: Browser console (F12) → should see `model: "huggingface"`

---

## SUCCESS INDICATORS

✅ Backend console shows:
```
✅ HF token found in environment variables
✅ Real-ESRGAN enhancement completed successfully via HF API
```

✅ Browser console shows:
```
🚀 Enhancement started
✅ Enhancement successful: {model: "huggingface", psnr_after: 28.45}
```

✅ Gallery shows:
- PSNR metrics (only with Real-ESRGAN)
- Before/after comparison slider
- Model used: "huggingface"

---

## ENVIRONMENT VARIABLES (Reference)

```
HF_API_TOKEN          = "hf_YOUR_TOKEN"     (REQUIRED for Real-ESRGAN)
HUGGINGFACE_API_KEY   = "hf_YOUR_TOKEN"     (Alternative)
HF_TOKEN              = "hf_YOUR_TOKEN"     (Alternative)
VITE_BACKEND_URL      = "http://localhost:8000"  (Dev)
                        OR
                      = "https://your-railway-backend.com" (Prod)
```

Backend checks in order:
1. HF_API_TOKEN
2. HUGGINGFACE_API_KEY
3. HF_TOKEN

Use ANY ONE of these!

---

## PRODUCTION DEPLOYMENT

### Railway Dashboard Environment Variables
```
HF_API_TOKEN=hf_your_real_token
VITE_BACKEND_URL=https://your-railway-backend.up.railway.app
```

### Frontend Vercel Environment Variables
```
VITE_BACKEND_URL=https://your-railway-backend.up.railway.app
```

---

## TROUBLESHOOTING FLOWCHART

```
Is it using PIL instead of Real-ESRGAN?
    ↓
    ├─ YES → Check backend logs for "HF token found"
    │   ├─ NOT THERE → Token not set before backend started
    │   │             FIX: Set token in same terminal before starting
    │   │
    │   └─ YES BUT STILL PIL → HF API is failing
    │       ├─ Is token valid? → Get new one from HF
    │       ├─ Is HF API down? → Check https://status.huggingface.co
    │       └─ Backend should show error details in logs
    │
    └─ NO → Great! Real-ESRGAN is working ✅
            Check browser console for "model: huggingface"
```

---

## KEY TAKEAWAY

**Set your HF token BEFORE starting backend in the SAME terminal:**

```powershell
# ✅ CORRECT:
$env:HF_API_TOKEN = "token"
python -m uvicorn ...  # In same terminal

# ❌ WRONG:
$env:HF_API_TOKEN = "token"  # Terminal 1
# Close terminal

# Terminal 2 (NEW - token lost!)
python -m uvicorn...  # Won't have token!
```

---

Made with ❤️ for real-time image super-resolution!
