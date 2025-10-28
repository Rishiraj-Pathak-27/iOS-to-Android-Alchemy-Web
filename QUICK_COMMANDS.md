# ⚡ Quick Commands Reference

## 🚀 Start the Application (1 Command)

```bash
cd frontend && npm run dev
```

Opens: **http://localhost:3000**

---

## 📋 Full Development Workflow

### Initial Setup (First Time Only)

```bash
# Clone and navigate
git clone <repo>
cd iphone-glow-studio

# Install dependencies
cd frontend
npm install

# Create .env (already done, but if needed)
echo "VITE_BACKEND_URL=https://happy-serenity-production.up.railway.app" > .env
```

### Daily Development

```bash
cd frontend
npm run dev
```

---

## 🏗️ Build & Deploy

### Build Frontend for Production

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Deploy Frontend to Vercel

```bash
vercel --prod
```

---

## 🧪 Testing

### Test Image Enhancement Locally

```bash
cd backend
python test_enhance.py
```

### Check Backend Health

```bash
curl https://happy-serenity-production.up.railway.app/
```

---

## 🔍 Debugging

### Clear Node Modules & Reinstall

```bash
cd frontend
rm -r node_modules package-lock.json
npm install
```

### Clear Cache

```bash
cd frontend
rm -r dist
npm run build
```

### View Backend Logs (Railway)

```bash
railway logs
```

---

## 📦 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Capture.tsx        ← Quality Metrics here
│   │   ├── Gallery.tsx
│   │   ├── Index.tsx
│   │   └── Upload.tsx
│   ├── components/            ← UI Components
│   └── lib/
│       ├── services/          ← API calls
│       └── utils.ts
├── .env                       ← Backend URL config
└── package.json
```

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `frontend/.env` | Backend URL config |
| `frontend/src/pages/Capture.tsx` | Quality Metrics UI |
| `frontend/src/lib/services/realEsrganApi.ts` | API calls |
| `backend/main.py` | Real-ESRGAN processing (Railway) |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend (Dev) | http://localhost:3000 |
| Frontend (Prod) | https://[your-vercel-url].vercel.app |
| Backend | https://happy-serenity-production.up.railway.app |
| API Endpoint | https://happy-serenity-production.up.railway.app/api/enhance |

---

## 💡 Common Tasks

### Change Backend URL

Edit `frontend/.env`:
```env
VITE_BACKEND_URL=https://your-new-backend.com
```

### Update Quality Metrics Colors

Edit `frontend/src/pages/Capture.tsx` around line 250:
```typescript
backgroundColor: ["#FB923C", "#3B82F6"],  // Change colors here
```

### Test with Different Image

Upload any image in the Upload page or capture with camera

### View Saved Galleries

Go to Gallery page → See all enhanced images with metrics

---

## 🆘 Troubleshooting Commands

```bash
# Check if backend is alive
curl -I https://happy-serenity-production.up.railway.app/

# Clear frontend cache
cd frontend && rm -rf dist node_modules && npm install

# Rebuild
npm run build

# Run development server
npm run dev
```

---

## 📊 What's Working ✅

- ✅ Camera capture
- ✅ Image enhancement (Real-ESRGAN)
- ✅ PSNR calculation
- ✅ Histogram generation
- ✅ Quality Metrics display
- ✅ Real-time graphs
- ✅ Gallery auto-save
- ✅ Mobile responsive
- ✅ Railway deployment
- ✅ CORS enabled

---

## 🎬 Next Steps

1. Run `cd frontend && npm run dev`
2. Open http://localhost:3000
3. Test Capture → Enhance → View Metrics
4. Build with `npm run build`
5. Deploy to Vercel

---

**Everything is ready to go!** 🚀
