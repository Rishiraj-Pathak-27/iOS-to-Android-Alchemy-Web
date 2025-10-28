# 🚀 Complete Setup & Startup Guide

## ✅ System Status

| Component | Status | Location |
|-----------|--------|----------|
| **Backend** | 🟢 Deployed | https://happy-serenity-production.up.railway.app |
| **Frontend** | 🟢 Ready | Local (http://localhost:3000) |
| **Database** | 🟢 Configured | Railway |
| **Gallery** | 🟢 localStorage | Browser storage |
| **Quality Metrics** | 🟢 Enabled | Real-time PSNR + Histograms |

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Frontend

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

This opens the app at: **http://localhost:3000**

### Step 2: Test the App

1. Navigate to **Camera Capture**
2. Take a photo
3. Click **Enhance Photo**
4. See **Quality Metrics** with PSNR graphs
5. Download or view in Gallery

### Step 3: Done! ✅

Everything works with your Railway backend!

---

## 🛠️ Configuration

### Frontend Environment Variables

**File:** `frontend/.env`
```env
VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app
```

The frontend automatically:
- Calls your Railway backend for image enhancement
- Displays PSNR graphs in real-time
- Saves all images to gallery with metrics

---

## 📊 What You Get

### After Capturing & Enhancing an Image:

```
┌─────────────────────────────────────────┐
│  QUALITY METRICS DASHBOARD              │
├─────────────────────────────────────────┤
│  Model used: Real-ESRGAN (HF API)      │
│                                         │
│  Before (Degraded): 17.95 dB           │
│  After (Enhanced):  31.95 dB           │
│                                         │
│  [PSNR Bar Chart]  [Histograms]        │
│                                         │
│  [New Photo] [Download Enhanced]       │
└─────────────────────────────────────────┘
```

### Features:
✅ Real-time PSNR comparison  
✅ Before/After histograms  
✅ Model indicator (Real-ESRGAN or PIL)  
✅ Auto-save to gallery  
✅ Responsive design  

---

## 📁 Project Structure

```
iphone-glow-studio/
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── pages/Capture.tsx   # ← Quality Metrics here
│   │   ├── components/         # UI components
│   │   └── lib/services/       # API calls
│   ├── .env                    # Backend URL config
│   └── package.json
├── backend/                     # FastAPI (deployed on Railway)
│   ├── main.py                 # Real-ESRGAN + PSNR computation
│   └── .env.backend            # HF token (git-ignored)
└── README.md
```

---

## 🔄 How It Works End-to-End

```
User Captures Photo
    ↓
Frontend sends to Railway backend
    ↓
Backend processes with Real-ESRGAN
Backend calculates PSNR & histograms
    ↓
Backend returns: enhanced_image + metrics
    ↓
Frontend displays Quality Metrics:
  • PSNR before/after
  • Bar chart
  • Histograms
    ↓
Auto-saved to gallery (localStorage)
    ↓
User can download or view later
```

---

## 🌐 Production Deployment

### Frontend (Vercel)
- Automatically reads `.env` for backend URL
- Deploy with: `npm run build`
- Env var: `VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app`

### Backend (Railway)
- Already deployed ✅
- URL: https://happy-serenity-production.up.railway.app
- Environment variables configured

---

## 📱 Mobile Support

The app is **fully responsive**:
- ✅ Mobile camera capture
- ✅ Touch-optimized UI
- ✅ Quality metrics on mobile
- ✅ Full chart display on small screens

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:** Check that `frontend/.env` has:
```env
VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app
```

### Issue: "Enhancement failed"
**Solution:** 
1. Backend might be cold-starting (first request takes ~30s)
2. Wait 10 seconds and retry
3. Check Railway dashboard for backend logs

### Issue: "Camera not working"
**Solution:**
1. Check browser permissions (Allow camera)
2. Try on HTTPS or localhost
3. Some browsers need HTTPS for camera

---

## 📊 Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/enhance` | POST | Enhance image (multipart/form-data) |
| `/health` | GET | Health check |
| `/` | GET | API info |

---

## 🎨 Customization

### Change Quality Metrics Appearance

**File:** `frontend/src/pages/Capture.tsx`

- Lines 200-250: Quality Metrics panel styling
- Lines 260-290: PSNR chart colors (orange/blue)
- Lines 300-350: Histogram styling

### Change Backend URL Dynamically

Edit `frontend/.env`:
```env
VITE_BACKEND_URL=https://your-backend-url.com
```

---

## ✨ Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Camera Capture | ✅ | Pages > Capture |
| Image Enhancement | ✅ | Backend (Railway) |
| PSNR Computation | ✅ | Backend |
| Histograms | ✅ | Backend |
| Real-time Graphs | ✅ | Frontend (Charts.js) |
| Gallery Storage | ✅ | localStorage |
| Model Detection | ✅ | Backend response |
| CORS Support | ✅ | Backend (all origins) |
| Mobile Support | ✅ | Responsive design |

---

## 🚀 Ready to Launch!

Everything is configured and ready to use:

1. ✅ Backend deployed on Railway
2. ✅ Frontend configured to use Railway
3. ✅ Quality Metrics implemented
4. ✅ Gallery auto-save working
5. ✅ PSNR graphs live
6. ✅ Histograms computed

**Just run:**
```bash
cd frontend
npm run dev
```

**Then open:** http://localhost:3000

---

**Last Updated:** October 28, 2025  
**Status:** ✅ PRODUCTION READY
