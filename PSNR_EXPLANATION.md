# How PSNR Values Are Calculated in iPhone Glow Studio

## Overview
PSNR (Peak Signal-to-Noise Ratio) measures the quality difference between two images. Higher PSNR = Better quality. It's measured in decibels (dB).

---

## The Complete PSNR Workflow

### Step 1: User uploads an image
```
User Image (Original)
└─ Size: e.g., 960x1280
└─ Format: JPEG/PNG
```

### Step 2: Two parallel processes happen

#### Process A: Create "DEGRADED" image (for PSNR Before)
```
Original Image (960x1280)
    ↓
1. Downscale to 25% size (240x320)
2. Apply Gaussian Blur (radius=2)
3. Upscale back to original size (960x1280)
4. Compress as low-quality JPEG (quality=25%)
    ↓
DEGRADED Image (poor quality, simulates compression artifacts)
    ↓
PSNR BEFORE = compare(degraded, original)
Example: PSNR Before = 20.45 dB
```

#### Process B: Enhance image (for PSNR After)
```
Original Image (960x1280)
    ↓
Real-ESRGAN or PIL Enhancement
    ↓
ENHANCED Image (4x upscaled to 3840x5120 with improvements)
    ↓
Compare with Original (after resizing to match)
    ↓
PSNR AFTER = compare(enhanced, original)
Example: PSNR After = 23.46 dB
```

---

## PSNR Calculation Formula

### Formula:
```
PSNR = 20 × log₁₀(MAX_PIXEL / √MSE)

Where:
- MAX_PIXEL = 255 (maximum RGB value)
- MSE = Mean Squared Error between two images
```

### How MSE is calculated:
```
1. Convert both images to RGB (if not already)
2. Handle size differences:
   - If images have different sizes, upscale the smaller one
   - This ensures fair pixel-by-pixel comparison
3. Convert pixel values to 64-bit floats (0-255)
4. Calculate: MSE = Average of (pixel_original - pixel_enhanced)²

Example:
Original pixel: [255, 128, 64]
Degraded pixel: [200, 100, 50]
Difference: [55, 28, 14]
Squared: [3025, 784, 196]

5. Average all squared differences → MSE
6. Apply PSNR formula
```

---

## Code Breakdown

### 1. DEGRADATION FUNCTION - Creates the "Before" baseline
```python
def degrade_image_jpeg(image_bytes: bytes, quality: int = 50) -> bytes:
    """
    Simulates a degraded/compressed image to show what needs enhancement
    """
    # 1. Downscale to 25% of size
    downscale = max(1, int(min(width, height) * 0.25))
    small = image.resize((downscale, downscale))
    
    # 2. Apply blur to lose sharpness
    small = small.filter(GaussianBlur(radius=2))
    
    # 3. Upscale back to original size (creates artifacts)
    degraded = small.resize((width, height))
    
    # 4. Compress as low-quality JPEG
    degraded.save(output, format='JPEG', quality=25)
    
    return degraded_bytes  # Poor quality image
```

### 2. PSNR COMPUTATION - Core metric calculation
```python
def compute_psnr(image1_bytes: bytes, image2_bytes: bytes) -> float:
    """
    Compare two images and return PSNR value
    
    Args:
        image1: First image (degraded or enhanced)
        image2: Second image (original for comparison)
    
    Returns:
        PSNR value in dB (Higher = Better)
    """
    # Load images
    img1 = Image.open(image1_bytes).convert('RGB')
    img2 = Image.open(image2_bytes).convert('RGB')
    
    # Handle size differences
    if img1.size != img2.size:
        if img1 is larger:
            img2 = upscale(img2, to=img1.size)
        else:
            img1 = downscale(img1, to=img2.size)
    
    # Convert to numeric arrays
    arr1 = numpy.array(img1, dtype=float64)
    arr2 = numpy.array(img2, dtype=float64)
    
    # Calculate Mean Squared Error
    mse = numpy.mean((arr1 - arr2) ** 2)
    
    # Avoid division by zero
    if mse < 0.001:
        return None  # Images are too similar
    
    # Calculate PSNR
    psnr = 20 * log10(255 / sqrt(mse))
    
    return round(psnr, 2)  # Round to 2 decimals
```

### 3. ENHANCEMENT PROCESS - Creates the "After" baseline
```python
def enhance_with_huggingface(image_bytes):
    """
    Enhance image using Real-ESRGAN AI model
    """
    # Try Real-ESRGAN API (4x upscaling)
    enhanced = call_huggingface_api(image_bytes)
    
    if enhanced fails:
        # Fallback to PIL enhancement
        enhanced = enhance_with_pil_fallback(image_bytes)
    
    return enhanced_bytes
```

---

## Complete Flow in Your Application

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Uploads Image (960x1280)                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐         ┌──────────────────┐
   │  DEGRADED   │         │  ENHANCED        │
   │  Process    │         │  Process         │
   └─────────────┘         └──────────────────┘
        │                         │
        │ 1. Downscale 25%        │ 1. Real-ESRGAN
        │ 2. Blur                 │    or PIL
        │ 3. Upscale              │    Enhancement
        │ 4. Low quality JPEG     │
        │                         │ Result: 4x larger
        ▼                         ▼ (3840x5120)
   Degraded Image         Enhanced Image
   (Low quality)          (High quality)
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
   PSNR BEFORE            PSNR AFTER
   = compare(              = compare(
      degraded,              enhanced,
      original               original
   )                        )
   = 20.45 dB             = 23.46 dB
        │                         │
        └─────────┬───────────────┘
                  │
                  ▼
         Improvement = +3.01 dB
```

---

## Understanding PSNR Values

### PSNR Interpretation Guide:
```
< 20 dB  : Very poor image quality (clearly visible degradation)
20-30 dB : Poor to acceptable quality (noticeable artifacts)
30-40 dB : Good to excellent quality (imperceptible to the human eye)
> 40 dB  : Excellent quality (almost identical images)
```

### Example Scenario:
```
Original Image Quality: Baseline (100%)

After Degradation:
- Quality: ~50-60%
- PSNR: 20.45 dB
- Status: Poor (noticeable compression, blur, noise)

After Enhancement:
- Quality: ~70-80%
- PSNR: 23.46 dB
- Status: Better (+3.01 dB improvement)
- The enhancement recovered some of the lost quality
```

---

## Why This Approach?

### Advantages:
1. **Consistent**: Same image always produces same PSNR values
2. **Meaningful**: Shows actual quality improvement
3. **Quantifiable**: Measured in standard dB units
4. **Comparable**: Can compare different enhancement methods
5. **Fair**: Handles different image sizes properly

### Real-world Example:
```
Scenario: Enhance a compressed photo taken on poor internet

Original: 960x1280 image from phone
Quality: Good (PSNR reference)

After degradation (simulating poor quality):
- Downscaled + blurred + recompressed
- PSNR Before: 20.45 dB
- (This is what a poorly compressed image looks like)

After enhancement (Real-ESRGAN):
- Upscaled 4x with quality improvements
- PSNR After: 23.46 dB
- (Closer back to original quality)

User sees: "Enhancement improved quality by 3.01 dB"
```

---

## Key Points to Remember

✅ **PSNR Before**: Compares degraded image with original
- Measures how poor the "before" quality is
- Lower value = worse quality

✅ **PSNR After**: Compares enhanced image with original
- Measures how well enhancement recovered quality
- Higher value = better quality

✅ **Improvement**: PSNR After - PSNR Before
- Positive value = successful enhancement
- Shows how much quality was recovered

✅ **Formula**: 20 × log₁₀(255 / √MSE)
- MSE = mean squared error (pixel differences)
- Logarithmic scale (dB) = human perception aligned

---

## Visual Comparison

```
PSNR Before: 20.45 dB
[████░░░░░░] Quality: 40%
Shows: Noticeable compression, blur, artifacts

PSNR After: 23.46 dB
[██████░░░░] Quality: 60%
Shows: Better sharpness, fewer artifacts, improved detail

Improvement: +3.01 dB (+20% perceived improvement)
```
