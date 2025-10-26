# 🚀 Production Deployment Guide

## ✅ Backend Status: DEPLOYED ✅

Your backend is now live on Railway! 

### Backend URL
```
https://your-service-name.railway.app
```

**Find your exact URL:**
1. Go to Railway Dashboard
2. Click on your service
3. Copy the domain from the right panel

---

## 📋 Next Steps:

### Step 1: Get Backend Production URL
- [ ] Go to Railway Dashboard
- [ ] Find your backend domain
- [ ] Copy the URL (e.g., `https://ios-alchemy-backend.railway.app`)

### Step 2: Update Frontend Environment Variables

Create/Update: `frontend/.env.production`

```env
VITE_BACKEND_URL=https://your-service-name.railway.app
```

Replace `your-service-name` with your actual Railway domain.

### Step 3: Build Frontend

```bash
cd frontend
npm run build
# or
bun run build
```

This creates `frontend/dist/` ready for deployment.

### Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select your GitHub repo: `iOS-to-Android-Alchemy-Web`
5. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` or `bun run build`
   - **Output Directory**: `dist`
6. **Environment Variables**:
   - Key: `VITE_BACKEND_URL`
   - Value: `https://your-railway-backend-url.railway.app`
7. Click "Deploy"

### Step 5: Test Production

Once deployed:
1. Open your Vercel frontend URL
2. Upload an image
3. Verify it gets enhanced through the Real-ESRGAN API
4. Download and compare results

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       GitHub                                 │
│          iOS-to-Android-Alchemy-Web Repository              │
└──────────────────┬──────────────────────┬────────────────────┘
                   │                      │
                   ▼                      ▼
         ┌──────────────────┐    ┌──────────────────┐
         │  Vercel Deploy   │    │ Railway Deploy   │
         │   (Frontend)     │    │   (Backend)      │
         └──────────────────┘    └──────────────────┘
                   │                      │
                   │                      │
         Your Frontend App        FastAPI + Gunicorn
         (React + Vite)           (Real-ESRGAN API)
         
         https://               https://
         your-app.vercel.app    your-backend.railway.app
```

---

## 🔒 Security Notes

- CORS is set to `allow_origins=["*"]` - allows requests from any domain
- Backend validates all image uploads
- No sensitive API keys needed (using free Hugging Face API)
- Production URLs are secure HTTPS

---

## 📈 Monitoring

### Railway Backend Logs
- Go to Railway Dashboard → Your Service → Logs
- Monitor real-time requests and errors

### Vercel Frontend Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Check build logs for any issues

---

## 🐛 Troubleshooting

**Frontend can't connect to backend?**
- Check `VITE_BACKEND_URL` environment variable
- Verify backend is running (check Railway logs)
- Ensure backend URL is correctly set without trailing slash

**Backend returning 404 errors?**
- Check backend logs on Railway
- Verify `/api/enhance` endpoint is working
- Test with curl: `curl https://your-backend.railway.app/health`

**Images not enhancing?**
- Check if Hugging Face API is available
- Backend will fallback to PIL enhancement
- Check backend logs for API errors

---

## ✅ Deployment Checklist

- [ ] Backend deployed on Railway ✅ DONE
- [ ] Get backend production URL
- [ ] Create `frontend/.env.production` with backend URL
- [ ] Build frontend with `npm run build`
- [ ] Deploy frontend to Vercel
- [ ] Set `VITE_BACKEND_URL` in Vercel environment
- [ ] Test image enhancement end-to-end
- [ ] Verify before/after comparison slider works
- [ ] Verify gallery storage works
- [ ] Check error handling for failed uploads

---

## 📞 Need Help?

- **Railway Support**: https://railway.app/support
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Create an issue in your repo

