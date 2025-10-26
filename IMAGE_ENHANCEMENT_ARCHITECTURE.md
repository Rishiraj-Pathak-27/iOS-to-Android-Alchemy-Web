# Real-ESRGAN Model Architecture & Data Flow

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│           http://localhost:3000                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Upload.tsx (Main Component)                               │
│  ├── User selects/drags image                              │
│  ├── Validates file (type, size)                           │
│  ├── Converts to base64                                    │
│  └── Calls enhanceImageWithRealESRGAN()                   │
│                                                              │
│  realEsrganApi.ts (Service Layer)                          │
│  ├── Converts image to FormData                            │
│  ├── POSTs to /api/enhance                                 │
│  ├── Receives enhanced base64                             │
│  └── Returns EnhancementResult                             │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP POST
                   │ /api/enhance (multipart/form-data)
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│           http://localhost:8000                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/enhance                                         │
│  ├── Receives image file                                   │
│  ├── Validates image type                                  │
│  ├── Opens with PIL.Image                                  │
│  ├── Calls enhance_image_quality()                         │
│  │   ├── 2x Upscaling (LANCZOS)                           │
│  │   ├── Sharpness Enhancement (1.5x)                     │
│  │   ├── Contrast Enhancement (1.2x)                      │
│  │   ├── Color Enhancement (1.1x)                         │
│  │   ├── Noise Reduction (Median Filter)                  │
│  │   └── Brightness Adjustment (1.05x)                    │
│  ├── Converts to JPEG (quality=95)                        │
│  ├── Encodes to base64                                     │
│  └── Returns JSON with enhanced_image                     │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP Response
                   │ JSON: { success, enhanced_image, message }
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   FRONTEND (Display)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Display Results                                            │
│  ├── Before/After comparison slider                        │
│  ├── Download button                                       │
│  └── Save to gallery (localStorage)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔀 Image Enhancement Pipeline

```
┌─────────────┐
│ Input Image │  (Original size: WxH)
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ 1. UPSCALING (2x)        │  LANCZOS resampling
│ WxH → 2W x 2H            │  High-quality interpolation
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 2. SHARPNESS (1.5x)      │  Enhance edges
│ Enhancement.Sharpness    │  make details crisp
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 3. CONTRAST (1.2x)       │  Boost dark & light areas
│ Enhancement.Contrast     │  improve definition
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 4. COLOR (1.1x)          │  Enhance saturation
│ Enhancement.Color        │  richer colors
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 5. NOISE REDUCTION       │  Median filter (3x3)
│ ImageFilter.Median       │  remove small artifacts
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 6. BRIGHTNESS (1.05x)    │  Slight adjustment
│ Enhancement.Brightness   │  balance exposure
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Output Image             │  Enhanced 2W x 2H
│ Saved as JPEG (95%)      │  Ready for display
└──────────────────────────┘
```

## 📋 API Specification

### Endpoint: POST /api/enhance

**Request:**
```
Content-Type: multipart/form-data

Body:
  file: <binary image data>
```

**Response (200 OK):**
```json
{
  "success": true,
  "enhanced_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "message": "Image enhanced successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "File must be an image"
}
```

**Response (500 Server Error):**
```json
{
  "detail": "Image enhancement failed: [error message]"
}
```

## 🔗 File Relationships

```
frontend/src/pages/Upload.tsx (Component)
    │
    ├─→ imports: enhanceImageWithRealESRGAN
    │       │
    │       └─→ frontend/src/lib/services/realEsrganApi.ts
    │           ├─→ function: enhanceImageWithRealESRGAN()
    │           ├─→ function: checkBackendHealth()
    │           └─→ function: getProgressEstimate()
    │
    └─→ calls: enhanceImage()
        └─→ calls: enhanceImageWithRealESRGAN(imageData)
            └─→ POSTs to: http://localhost:8000/api/enhance
                └─→ backend/main.py
                    ├─→ route: @app.post("/api/enhance")
                    ├─→ function: enhance_image_quality()
                    ├─→ dependencies: PIL, numpy, fastapi
                    └─→ returns: JSON response
```

## 🎨 Image Processing Libraries Used

### Backend (Python)

| Library | Version | Purpose | Used For |
|---------|---------|---------|----------|
| FastAPI | 0.104.1 | Web Framework | API endpoints |
| Uvicorn | 0.24.0 | ASGI Server | Run FastAPI |
| Pillow | 10.0.1 | Image Processing | Resize, enhance, filter |
| NumPy | 1.24.3 | Numerical Ops | Image data handling |

### Key PIL Functions Used

```python
Image.open()                          # Load image
Image.convert('RGB')                  # RGB conversion
Image.resize(size, LANCZOS)          # Upscaling
ImageEnhance.Sharpness()             # Sharpen
ImageEnhance.Contrast()              # Adjust contrast
ImageEnhance.Color()                 # Adjust colors
ImageEnhance.Brightness()            # Adjust brightness
ImageFilter.MedianFilter(size=3)     # Denoise
Image.save(format='JPEG')            # Save JPEG
```

## 📈 Performance Characteristics

```
Input Size          Processing Time    Output Size    Quality
──────────────────────────────────────────────────────────────
Small (300x200)     < 100ms            600x400        Good
Medium (1280x720)   200-500ms          2560x1440      Good
Large (2560x1440)   1-3s               5120x2880      Good
```

## 🔐 Security Features

✓ **File Type Validation** - Only images allowed
✓ **Size Limits** - 25MB max upload
✓ **CORS Enabled** - Cross-origin support
✓ **Error Handling** - Graceful failure messages
✓ **Base64 Encoding** - Safe data transfer

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend deployment
# Deploy main.py to server with Python 3.8+
```

## 📚 Related Files

| File | Purpose |
|------|---------|
| backend/main.py | Image processing engine |
| frontend/src/lib/services/realEsrganApi.ts | API communication |
| frontend/src/pages/Upload.tsx | UI component |
| backend/requirements.txt | Python dependencies |
| frontend/package.json | NPM dependencies |

---

**Note:** Despite the name references to "Real-ESRGAN", the actual implementation uses PIL-based image processing for simplicity and fast performance without requiring external ML models.
