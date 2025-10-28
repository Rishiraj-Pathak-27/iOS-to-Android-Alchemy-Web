# Real-ESRGAN App - Issues Fixed & Improvements

**Date:** October 28, 2025  
**Commit:** `34f6fe1` (main branch)

---

## 🎯 Issues Fixed

### Issue 1: Backend Using PIL as Default Instead of Real-ESRGAN
**Problem:** Even with HF token available, backend was falling back to PIL processing immediately.

**Root Cause:** 
- Previous code had issues with environment variable detection
- Backend was not properly checking for HF tokens

**Solution Applied:**
1. ✅ Fixed env var check to look for standard names: `HF_API_TOKEN`, `HUGGINGFACE_API_KEY`, `HF_TOKEN`
2. ✅ Improved HF API attempt logic:
   - Tries HF even without token (some models allow free tier access)
   - Retries up to 3 times with 1-second delays between attempts
   - Increased timeout from 30s to 40s
   - Captures detailed debug info about each attempt (status, response type, error messages)
3. ✅ Only falls back to PIL if HF genuinely fails after all retries
4. ✅ Added `hf_debug` object tracking each attempt for diagnostics

**Backend Changes (`backend/main.py`):**
```python
# Now checks standard env var names
hf_token = os.getenv("HF_API_TOKEN") or os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN")

# Improved retry logic with 3 attempts and 1s delays
for attempt in range(3):
    # Try HF API
    # ... detailed logging and debug capture ...

# Only fallback to PIL after HF fails
if all_attempts_failed:
    pil_bytes = enhance_with_pil_fallback(image_bytes)
```

---

### Issue 2: Camera Capture Feature Not Working
**Problem:** After capturing a photo and clicking "Enhance Photo", the enhancement failed with errors.

**Root Causes:**
1. **CORS issue:** Capture.tsx was using relative path `/api/enhance` which doesn't work when frontend and backend are on different ports/origins
2. **Missing import:** Wasn't using the `enhanceImageWithRealESRGAN` service that handles backend URL correctly
3. **Direct fetch:** Using raw fetch instead of the centralized API service layer

**Solution Applied:**
1. ✅ Imported `enhanceImageWithRealESRGAN` from `realEsrganApi.ts` service
2. ✅ Updated `enhanceImage()` function to use the API service instead of direct fetch
3. ✅ Added detailed console logging at each step for debugging
4. ✅ Properly handle histograms metadata in gallery storage

**Frontend Changes (`frontend/src/pages/Capture.tsx`):**
```typescript
// Before: Direct fetch to relative path
const resp = await fetch("/api/enhance", { ... });

// After: Use API service with proper backend URL handling
const result = await enhanceImageWithRealESRGAN(imageData);
```

The API service (`realEsrganApi.ts`) correctly uses:
```typescript
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const ENHANCEMENT_ENDPOINT = `${BACKEND_API_URL}/api/enhance`;
```

---

## 📊 Processing Priority (New)

### Before Fix
1. Check if HF token exists
2. If NO token → PIL fallback (❌ Wrong priority)
3. If YES token → Try HF API

### After Fix (✅ Correct Priority)
1. **PRIMARY:** Try HF Real-ESRGAN API (3 attempts with retries)
   - With token → Full authorization
   - Without token → Try free tier access
2. **FALLBACK:** Use PIL enhancement (only if HF fails)
3. Return detailed `hf_debug` info for diagnostics

---

## 🔧 Technical Details

### Environment Variables (Set on Railway or locally)
```powershell
# Set one of these (backend checks all three)
# Replace YOUR_HF_TOKEN with your actual Hugging Face token
$env:HF_API_TOKEN = "YOUR_HF_TOKEN"
# OR
$env:HUGGINGFACE_API_KEY = "YOUR_HF_TOKEN"
# OR
$env:HF_TOKEN = "YOUR_HF_TOKEN"
```

### Backend Improvements
- **Content-Type:** Changed from `image/png` to `application/octet-stream` (more robust)
- **Retry Logic:** 3 attempts with 1-second delays and detailed logging
- **Error Handling:** Captures HF response bodies (JSON or text) for debugging
- **Upload Logging:** Logs filename, content-type, and byte size
- **Fallback:** PIL enhancement only triggered after HF genuinely fails

### Frontend Improvements
- **API Service:** Centralized `enhanceImageWithRealESRGAN()` function handles all backend communication
- **CORS Handling:** Backend URL resolved from `VITE_BACKEND_URL` env var (production) or localhost:8000 (dev)
- **Detailed Logging:** Console shows request status, response status, errors, and success metrics
- **Gallery Storage:** Saves PSNR history, histograms, and model info metadata

---

## 🧪 How to Test Locally

### 1. Set HF Token
```powershell
$env:HF_API_TOKEN = "hf_your_real_token_here"
```

### 2. Start Backend
```powershell
cd d:\iphone-glow-studio
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --log-level info
```

### 3. Start Frontend (in another terminal)
```powershell
cd d:\iphone-glow-studio
npm run dev
```

### 4. Test Capture Flow
1. Open http://localhost:5173 (or your frontend port)
2. Navigate to Capture page
3. Allow camera access
4. Tap camera button to capture photo
5. Click "Enhance Photo"
6. Open browser DevTools (F12 → Console) to see detailed logs

### 5. Check Logs
**Backend Console Should Show:**
```
Attempting Real-ESRGAN enhancement via Hugging Face API...
✅ HF token found in environment variables
HF API attempt 1/3...
✅ Real-ESRGAN enhancement completed successfully via HF API
✅ Image enhancement completed successfully
```

**Browser Console Should Show:**
```
🚀 Enhancement started. Backend URL: http://localhost:8000
📞 Calling enhanceImageWithRealESRGAN service...
📤 Sending request to backend...
📥 Response status: 200
✅ Enhancement successful: {model: "huggingface", psnr_after: 28.45}
```

---

## 🚀 Production Deployment (Railway)

### Required Environment Variables
Set in Railway dashboard under Variables:
```
HF_API_TOKEN=hf_your_token_here
# OR one of:
HUGGINGFACE_API_KEY=hf_your_token_here
HF_TOKEN=hf_your_token_here
```

### Frontend Deployment (Vercel)
```
VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app
```

### Monitoring
1. Check Railway logs for HF API attempt details
2. Monitor response times (should be 10-30s for typical images)
3. If HF fails, PIL fallback will activate automatically (slower but always works)

---

## 📝 Files Modified

1. **`backend/main.py`** (+30 lines, -20 lines)
   - Fixed `enhance_with_huggingface()` env var check
   - Improved retry logic and diagnostics
   - Added detailed logging

2. **`frontend/src/pages/Capture.tsx`** (+15 lines, -30 lines)
   - Imported `enhanceImageWithRealESRGAN` service
   - Updated `enhanceImage()` to use API service
   - Added detailed console logging
   - Improved error handling

3. **`frontend/src/lib/services/realEsrganApi.ts`** (unchanged, already correct)
   - Already handles backend URL via `VITE_BACKEND_URL` env var
   - Already includes detailed logging

---

## ✅ Verification Checklist

- [x] Backend syntax validated (Python compilation)
- [x] Backend starts without errors
- [x] HF token detection uses standard env var names
- [x] Real-ESRGAN is primary, PIL is fallback
- [x] Capture component uses API service (not direct fetch)
- [x] CORS/backend URL handled correctly
- [x] Detailed logging on both backend and frontend
- [x] All changes committed and pushed to main
- [x] No hardcoded secrets or token names left in code

---

## 🎯 Next Steps (Optional)

1. **Test with different HF models** by changing `api_url` in `enhance_with_huggingface()`
2. **Add progress endpoint** to track long-running enhancement requests
3. **Implement image queue** if multiple users submit simultaneously
4. **Add rate limiting** on backend to prevent abuse
5. **Monitor HF API costs** and consider caching results for identical inputs

---

## 📞 Support

If issues persist:
1. Check backend logs for `hf_debug` information
2. Check browser console for frontend errors
3. Verify HF token is set: `echo $env:HF_API_TOKEN`
4. Test backend health: `curl http://localhost:8000/health`
5. Check CORS headers: Open Network tab in DevTools

**Commit Details:**
- Author: Copilot
- Branch: main
- Previous: cecee3c
- Current: 34f6fe1
- Message: "Fix: make Real-ESRGAN primary with PIL fallback, fix Capture using API service"
