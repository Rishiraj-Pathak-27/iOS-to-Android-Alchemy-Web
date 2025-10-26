# ✨ Fresh Vercel Deployment Checklist

## 🚀 Deploy Fresh on Vercel - Step by Step

### Prerequisites
- ✅ GitHub account
- ✅ Vercel account (https://vercel.com)
- ✅ Backend deployed on Railway: `https://ios-to-android-alchemy-web-production.up.railway.app`

---

## 📋 Step-by-Step Fresh Deployment

### Step 1: Remove Old Deployment (Optional)
If you want to remove the old one:
1. Go to https://vercel.com/dashboard
2. Find your old project
3. Click Settings → Danger Zone → Delete Project

### Step 2: Go to Vercel Dashboard
Open: https://vercel.com/dashboard

### Step 3: Add New Project
- Click "Add New..." (top right)
- Select "Project"

### Step 4: Import from GitHub
- Click "Continue with GitHub"
- Find your repo: `iOS-to-Android-Alchemy-Web`
- Click "Import"

### Step 5: Configure Project

**Framework Preset:**
- Leave as auto-detected (Vite)

**Root Directory:**
- Click "Edit" 
- Select: `frontend`
- Click "Save"

**Build & Development Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 6: Add Environment Variables ⚠️ IMPORTANT!

**Before clicking Deploy:**

1. Click "Environment Variables" section
2. Add new variable:
   ```
   VITE_BACKEND_URL
   https://ios-to-android-alchemy-web-production.up.railway.app
   ```
3. Select: "Production, Preview, Development"
4. Click "Add"

**Result should show:**
```
VITE_BACKEND_URL = https://ios-to-android-alchemy-web-production.up.railway.app (3 environments)
```

### Step 7: Deploy
- Click "Deploy"
- Wait for build and deployment (usually 1-3 minutes)

### Step 8: Success!
You'll see:
- ✅ Build successful
- ✅ Deployment complete
- 🔗 Your production URL: `https://your-project.vercel.app`

---

## 🎯 After Deployment

1. **Copy your Vercel URL** (e.g., `https://ios-alchemy-web.vercel.app`)
2. **Open it in browser** - You should see your React app
3. **Upload a test image** - Test image enhancement
4. **Verify it works** - Check before/after comparison

---

## 🔧 If Environment Variable Wasn't Set:

**Set it after deployment:**
1. Go to Vercel Dashboard → Your Project
2. Click "Settings"
3. Click "Environment Variables"
4. Add:
   ```
   Name: VITE_BACKEND_URL
   Value: https://ios-to-android-alchemy-web-production.up.railway.app
   ```
5. Click "Add"
6. Go to "Deployments"
7. Click the latest deployment
8. Click "Redeploy" → "Redeploy"

---

## 📊 Deployment Summary

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | ✅ Deployed | `https://ios-to-android-alchemy-web-production.up.railway.app` |
| Frontend App | ⏳ Deploying | `https://your-project.vercel.app` |
| Environment | ✅ Ready | `VITE_BACKEND_URL` configured |

---

## ✅ Final Checklist

- [ ] Old Vercel project removed (optional)
- [ ] New project imported from GitHub
- [ ] `frontend` set as root directory
- [ ] Environment variable `VITE_BACKEND_URL` added
- [ ] Deployment successful
- [ ] Vercel URL copied
- [ ] Test image uploaded
- [ ] Image enhancement working
- [ ] Before/after comparison visible

---

## 🚨 Troubleshooting

**"Build failed"**
- Check build logs in Vercel
- Ensure Node.js version is 18+
- Check for TypeScript errors: `npm run build` locally

**"Cannot connect to backend"**
- Verify `VITE_BACKEND_URL` environment variable is set
- Check Railway backend is running: Visit `https://ios-to-android-alchemy-web-production.up.railway.app/health`
- Redeploy Vercel project after adding env var

**"Blank page or 404"**
- Check Vercel deployment logs
- Ensure `dist` is the output directory
- Try clearing browser cache (Ctrl+Shift+Delete)

---

## 💡 Pro Tips

1. **Auto-deployments enabled** - Push to `main` branch = auto-deploy to Vercel
2. **Preview deployments** - Create pull requests = get preview URLs
3. **Rollback** - Go to Deployments → Click previous version → Redeploy

