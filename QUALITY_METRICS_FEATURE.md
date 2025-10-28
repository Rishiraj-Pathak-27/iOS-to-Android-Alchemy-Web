# Quality Metrics Feature - Real-Time PSNR Graphs

## ✅ What Was Added

After capturing and enhancing an image, users now see:

### 1. **Quality Metrics Display**
   - Model used badge (Real-ESRGAN HF API or PIL fallback)
   - Warning icon when PIL fallback is used

### 2. **PSNR Comparison Section**
   - **Before (Degraded)**: PSNR value in dB (orange card)
   - **After (Enhanced)**: PSNR value in dB (blue card)
   - **Bar Chart**: Visual comparison of before/after PSNR values

### 3. **Frequency Distribution (Histograms)**
   - **Before Histogram**: Grayscale distribution of degraded image (orange line)
   - **After Histogram**: Grayscale distribution of enhanced image (blue line)
   - Real-time computation from backend

## 📊 Visual Layout

```
┌─────────────────────────────────────────┐
│     Image Comparison Slider             │
│  (Before/After with drag control)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         QUALITY METRICS                 │
│                                         │
│  Model used: Real-ESRGAN (HF API)      │
│                                         │
│  ┌──────────────┐  ┌──────────────────┐
│  │ Before       │  │ PSNR Bar Chart   │
│  │ 17.95 dB     │  │                  │
│  │              │  │  17.95  31.95    │
│  │ After        │  │   ▓      ▓       │
│  │ 31.95 dB     │  └──────────────────┘
│  └──────────────┘
│
│  Frequency Distribution (Grayscale)
│  ┌────────────────┐  ┌────────────────┐
│  │ Before         │  │ After          │
│  │ (Degraded)     │  │ (Enhanced)     │
│  │ ─────────────  │  │ ─────────────  │
│  │   /\  /\      │  │  /\            │
│  │  /  \/  \     │  │ /  \           │
│  └────────────────┘  └────────────────┘
└─────────────────────────────────────────┘

[New Photo]  [Download Enhanced]
```

## 🔄 Data Flow

```
User Captures Image
    ↓
User Clicks "Enhance Photo"
    ↓
Frontend calls enhanceImageWithRealESRGAN()
    ↓
Backend processes image (Real-ESRGAN + PSNR calculation)
    ↓
Backend returns:
  - enhanced_image (base64)
  - psnr_before, psnr_after
  - histograms (256-bin arrays)
  - model_used
    ↓
Frontend displays Quality Metrics with graphs
    ↓
Data automatically saved to Gallery (localStorage)
```

## 💾 Gallery Storage

Each enhancement is saved with complete metadata:

```javascript
{
  original_image_url: "data:image/jpeg;base64,...",
  enhanced_image_url: "data:image/jpeg;base64,...",
  metadata: {
    source: "camera_capture",
    psnr_history: [{
      timestamp: "2025-10-28T...",
      psnr_before: 17.95,
      psnr_after: 31.95,
      model: "huggingface"
    }],
    model_used: "huggingface",
    histograms: {
      original: [10, 20, 15, ...],  // 256 bins
      degraded: [8, 18, 12, ...],   // 256 bins
      enhanced: [5, 25, 20, ...]    // 256 bins
    }
  }
}
```

## 📁 Modified Files

- `frontend/src/pages/Capture.tsx`
  - Added `QualityMetrics` interface
  - Added `qualityMetrics` state
  - Added Quality Metrics display component
  - Integrated Chart.js for PSNR bar chart and histograms
  - All data automatically saved to gallery

## 🎯 Features

✅ **Real-time display** - Shows metrics immediately after enhancement  
✅ **Two chart types** - Bar chart for PSNR, line charts for histograms  
✅ **Model indicator** - Shows which model was used (HF API or PIL)  
✅ **Auto-save to gallery** - Metrics stored with each image  
✅ **Responsive design** - Works on desktop and mobile  
✅ **No additional dependencies** - Uses existing Chart.js  

## 🚀 How It Works

1. User captures image with camera
2. User clicks "Enhance Photo"
3. Backend processes with Real-ESRGAN (or PIL fallback)
4. Backend calculates PSNR and histograms
5. Frontend receives all metrics
6. **Quality Metrics panel displays:**
   - Model used badge
   - PSNR before/after values
   - Bar chart comparing PSNR
   - Line charts showing frequency distributions
7. Data is automatically saved to gallery

## 📝 Backend Requirements

The backend must return (already implemented in `backend/main.py`):

```python
{
  "success": true,
  "enhanced_image": "base64_string",
  "model_used": "huggingface" | "pil",
  "psnr_before": 17.95,
  "psnr_after": 31.95,
  "histograms": {
    "original": [...256 values...],
    "degraded": [...256 values...],
    "enhanced": [...256 values...]
  }
}
```

---

**Feature Complete** ✅
