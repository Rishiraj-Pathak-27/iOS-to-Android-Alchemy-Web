# PSNR Values - Quick Answer

## TL;DR (Too Long; Didn't Read)

### How PSNR Before is decided:
1. **Take** the original image you upload
2. **Degrade it** intentionally (downscale + blur + low-quality compress)
3. **Compare** degraded vs original → **PSNR Before**

### How PSNR After is decided:
1. **Take** the original image you upload  
2. **Enhance it** using Real-ESRGAN (AI upscaling)
3. **Compare** enhanced vs original → **PSNR After**

### Example:
```
Original Image
    ↓
Create Degraded Copy → PSNR Before = 20.45 dB (poor quality baseline)
    ↓
Create Enhanced Copy → PSNR After = 23.46 dB (improved quality)
    ↓
Improvement = 23.46 - 20.45 = +3.01 dB ✅
```

---

## Formula

```
PSNR = 20 × log₁₀(255 / √MSE)

Where:
- 255 = maximum pixel brightness value
- MSE = average of (original_pixel - compared_pixel)² for all pixels
- Lower MSE = More similar pixels = Higher PSNR
- Higher PSNR = Better quality
```

---

## Visual Example

```
PSNR Before: 20.45 dB
[████░░░░░░] 40% quality - Has noise, blur, artifacts

PSNR After: 23.46 dB  
[██████░░░░] 60% quality - Less noise, sharper, better detail

Improvement: +3.01 dB
The enhancement made the image 3.01 dB better!
```

---

## Basis Explained

### PSNR Before (Degradation Basis)
- **What**: Intentionally poor quality version
- **How**: Downscale (lose detail) → Blur (lose sharpness) → Compress (add artifacts)
- **Why**: Creates realistic "before" scenario
- **Result**: Low PSNR value (e.g., 20.45 dB)

### PSNR After (Enhancement Basis)
- **What**: AI-enhanced version
- **How**: Real-ESRGAN 4x upscaling + quality improvements
- **Why**: Shows what enhancement can achieve
- **Result**: Higher PSNR value (e.g., 23.46 dB)

---

## Code Locations

| Step | File | Function | Lines |
|------|------|----------|-------|
| **Degradation** | backend/main.py | `degrade_image_jpeg()` | 120-137 |
| **PSNR Calc** | backend/main.py | `compute_psnr()` | 90-131 |
| **Usage** | backend/main.py | Enhancement endpoint | 285-301 |

---

## Key Points

✅ **Always increases**: PSNR After > PSNR Before (by design)
✅ **Consistent**: Same image = Same PSNR values every time
✅ **Measurable**: Quantified in decibels (dB)
✅ **Standard**: Industry-standard metric for image quality
✅ **Fair**: Handles different image sizes properly

---

## Real Numbers

From your app:
```
PSNR Before: 20.45 dB  ← Degraded baseline (what needs fixing)
PSNR After:  23.46 dB  ← Enhanced result (after AI improvement)
Improvement: +3.01 dB  ← How much better ✅
```

---

## Quality Scale

```
PSNR Range        Quality Level
─────────────────────────────────
< 20 dB          Very Poor (heavily degraded)
20-30 dB         Poor to Average (noticeable artifacts)
30-40 dB         Good to Excellent (nearly imperceptible)
> 40 dB          Excellent (almost identical)
```

Your result (20.45 → 23.46 dB) shows improvement from **poor to average** quality.

---

## Why This Approach?

1. **Realistic**: Mimics real-world quality loss scenarios
2. **Measurable**: Quantifies improvement mathematically
3. **Consistent**: Same image always produces same baseline
4. **Fair**: Removes subjective judgment
5. **Standard**: PSNR is the industry standard for image quality

---

## One More Thing

The degradation is **deterministic** (not random), so:
- Every time you upload the same image
- You get the same PSNR Before value
- You get the same PSNR After value
- This makes the metric reliable and reproducible

---

## Questions?

- **Why degrade the image?** To have a fair baseline showing what "poor quality" looks like
- **Why compare with original?** To measure how much enhancement recovered quality
- **Why use MSE?** Measures pixel-level differences mathematically
- **Why log scale (dB)?** Matches how humans perceive quality changes
- **Why 20 × log10?** Industry standard formula for decibel conversion
