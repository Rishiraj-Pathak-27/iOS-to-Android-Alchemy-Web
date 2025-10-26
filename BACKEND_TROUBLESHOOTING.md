# 🔧 Backend Not Working - Diagnostic & Fix Guide

## ⚠️ Issue: Backend Server Not Responding

Your Railway backend deployment might be:
- Crashed during startup
- Running out of memory
- Having network issues
- Missing environment variables

---

## 🔍 Step 1: Check Railway Logs

1. Go to: https://railway.app/dashboard
2. Click on your project/service
3. Click "Logs" tab
4. Look for error messages
5. Screenshot or copy the error

Common errors:
- `OutOfMemory` - Container too small
- `Port already in use` - Container restart issue
- `Module not found` - Missing dependency

---

## 🛠️ Step 2: Quick Fix - Redeploy

1. Go to Railway Dashboard
2. Find your backend service
3. Click "Deployments" tab
4. Find the failed deployment
5. Click "..." menu
6. Click "Redeploy"
7. Wait 2-3 minutes

---

## 📋 Step 3: Verify Backend Health

**Check if backend is accessible:**

Open in browser:
```
https://ios-to-android-alchemy-web-production.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "ok",
  "model": "Real-ESRGAN (Hugging Face with PIL Fallback)",
  "scale": 4,
  "upscaling": "4x upscaling via Real-ESRGAN"
}
```

---

## 🚨 Step 4: If Redeploy Doesn't Work

### Option A: Delete and Recreate on Railway

1. Go to Railway Dashboard
2. Click Settings (⚙️)
3. Scroll to "Danger Zone"
4. Click "Delete Service"
5. Create new deployment:
   - Click "New" → "GitHub Repo"
   - Select your repo
   - Leave root directory empty
   - Deploy

### Option B: Use Alternative Backend Service

Deploy to **Render** instead (more reliable):
1. Go to: https://render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub
5. Select repo and `backend` folder
6. Deploy

---

## 🚀 Step 5: Temporary Fix - Use Local Backend

While you fix Railway, use local backend:

1. **Keep backend running locally**: `python backend/main.py`
2. **Update frontend environment**:
   - Go to Vercel Dashboard
   - Settings → Environment Variables
   - Change `VITE_BACKEND_URL` to `http://localhost:8000`
   - BUT: Only works if you keep local backend running

**This is temporary** - not for production

---

## 📊 Backend Status Checklist

- [ ] Railway logs checked for errors
- [ ] Logs shared/noted
- [ ] Deployment redeployed
- [ ] Health endpoint checked
- [ ] Local backend tested
- [ ] Works with local backend?
- [ ] Fixed on Railway?

---

## 🔧 Common Fixes

### Fix 1: Railway Container Limits
1. Go to Railway Service Settings
2. Look for "Memory" or "CPU" limits
3. Increase if too low (suggest 1GB memory)
4. Redeploy

### Fix 2: Rebuild from Fresh
1. Railway Dashboard
2. Find service
3. Click "..." menu
4. Click "Remove Service"
5. Push to GitHub (trigger new deploy)
6. Railway auto-deploys new version

### Fix 3: Add Health Check Endpoint
Backend already has `/health` endpoint
But Railway may not be detecting it
- Go to Service Settings
- Look for "Health Check"
- Set path to `/health`
- Set interval to 30 seconds

---

## 📞 Manual Testing

**Test backend endpoints manually:**

### Test 1: Health Check
```bash
curl https://ios-to-android-alchemy-web-production.up.railway.app/health
```

### Test 2: Available Models
```bash
curl https://ios-to-android-alchemy-web-production.up.railway.app/api/models
```

### Test 3: Upload Image (requires image file)
```bash
curl -X POST \
  -F "file=@image.jpg" \
  https://ios-to-android-alchemy-web-production.up.railway.app/api/enhance
```

---

## 🆘 Need More Help?

### Check These Files
- `backend/main.py` - Backend code
- `backend/requirements.txt` - Dependencies
- `Dockerfile` - Container configuration
- `railway.toml` - Railway configuration

### Resources
- Railway Support: https://railway.app/support
- FastAPI Docs: https://fastapi.tiangolo.com/
- Docker Docs: https://docs.docker.com/

---

## ✅ Once Fixed

1. **Test backend health check** - Should return JSON
2. **Test from frontend** - Upload image, should enhance
3. **Check Vercel logs** - Should show successful requests
4. **Monitor both dashboards** - Check for errors

---

**Next Action:**
1. Check Railway logs
2. Report the error message
3. I'll help you fix it!

