# 🚀 Vercel Frontend Deployment - Quick Guide

## ✅ Status
- ✅ Backend: Deployed on Railway
- ✅ Frontend: Built and ready
- ⏳ Frontend: Ready to deploy to Vercel

## 📋 Deploy to Vercel in 5 Steps

### Step 1: Go to Vercel
Open: https://vercel.com

### Step 2: Sign in with GitHub
- Click "Continue with GitHub"
- Authorize Vercel to access your GitHub repos

### Step 3: Import Your Project
- Click "Add New..." → "Project"
- Find and select: `iOS-to-Android-Alchemy-Web`
- Click "Import"

### Step 4: Configure Project

**Root Directory:**
- Select: `frontend`
- Click "Edit" if needed

**Build Settings (Should be auto-detected):**
- Framework: `Next.js` or `Vite`
- Build Command: `npm run build` (or `bun run build`)
- Output Directory: `dist`

### Step 5: Add Environment Variables

**IMPORTANT:** Before clicking Deploy!

1. Click "Environment Variables"
2. Add new variable:
   ```
   Name: VITE_BACKEND_URL
   Value: https://ios-to-android-alchemy-web-production.up.railway.app
   ```
3. Select "Production" environment
4. Click "Add"

### Step 6: Deploy!
- Click "Deploy"
- Wait 2-3 minutes for build and deployment
- You'll get a live URL like: `https://your-project.vercel.app`

---

## 🎯 After Deployment

1. **Open your Vercel URL**
2. **Upload a test image**
3. **Verify it enhances** through Real-ESRGAN
4. **Check before/after** comparison
5. **Try downloading** the enhanced image

---

## ❌ Troubleshooting

**"Cannot fetch from backend"**
- Check if `VITE_BACKEND_URL` is set correctly in Vercel
- Verify Railway backend is running
- Check browser console for CORS errors

**"Build fails on Vercel"**
- Check build logs in Vercel dashboard
- Ensure `frontend` is selected as root directory
- Verify all dependencies are in `package.json`

**"Images not enhancing"**
- Check backend health: Visit `https://ios-to-android-alchemy-web-production.up.railway.app/health`
- Check Railway logs for errors
- Backend may be using PIL fallback if Hugging Face API is slow

---

## 📊 Final Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        GitHub                                 │
│           iOS-to-Android-Alchemy-Web (Main Branch)           │
└─────────────────────┬──────────────────────┬─────────────────┘
                      │                      │
                      ▼                      ▼
              ┌─────────────────┐   ┌──────────────────┐
              │   Vercel CDN    │   │   Railway App    │
              │   (Frontend)    │   │   (Backend API)  │
              └─────────────────┘   └──────────────────┘
                      │                      │
                      │◄────────────────────►│
                      │   HTTP Requests      │
                      │   (Real-ESRGAN)      │
                      │                      │
              Your React App          FastAPI + Gunicorn
              (Optimized Build)       (Image Enhancement)
```

---

## ✨ Production URLs

**Frontend:** `https://your-project.vercel.app`
**Backend:** `https://ios-to-android-alchemy-web-production.up.railway.app`

Both will automatically update when you push to `main` branch! 🎉

