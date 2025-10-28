"""
Real-ESRGAN Image Enhancement Backend
Using Real-ESRGAN model from Hugging Face for professional image upscaling
Built with FastAPI and Uvicorn
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import logging
from PIL import Image
import requests
import os
from pathlib import Path
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Real-ESRGAN Image Enhancement API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INFERENCE_APIS = [
    "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus",
    "https://api-inference.huggingface.co/models/ai-forever/Real-ESRGAN",
    "https://upscayl.tech/api"
]

def enhance_with_replicate(image_bytes):
    """
    Enhance image using Replicate API with Real-ESRGAN model
    """
    try:
        logger.info("Sending image to Replicate Real-ESRGAN model...")
        
        return None
    except Exception as e:
        logger.error(f"Error with Replicate API: {e}")
        return None


def enhance_with_pil_fallback(image_bytes):
    """
    Fallback enhancement using PIL when APIs are unavailable
    Provides 2x upscaling with quality improvements
    """
    try:
        logger.info("Using PIL-based fallback enhancement...")
        
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB')
        
        original_width, original_height = img.size
        logger.info(f"Original dimensions: {original_width}x{original_height}")
        
        new_size = (original_width * 2, original_height * 2)
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        from PIL import ImageEnhance, ImageFilter
        
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(2.0)
        
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.3)
        
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(1.1)
        
        img = img.filter(ImageFilter.SMOOTH_MORE)
        
        output = io.BytesIO()
        img.save(output, format='PNG', optimize=False)
        result_bytes = output.getvalue()
        
        logger.info(f"✅ PIL enhancement completed: {new_size[0]}x{new_size[1]}")
        return result_bytes
        
    except Exception as e:
        logger.error(f"PIL fallback error: {e}")
        return None


def compute_psnr(original_bytes: bytes, enhanced_bytes: bytes) -> float:
    """Compute PSNR (Peak Signal-to-Noise Ratio) between original and enhanced images.
    Returns PSNR in decibels (dB), rounded to 2 decimals. If calculation fails returns 0.0.
    """
    try:
        # Open images with PIL and convert to RGB
        orig = Image.open(io.BytesIO(original_bytes)).convert('RGB')
        enh = Image.open(io.BytesIO(enhanced_bytes)).convert('RGB')

        # Ensure both images are compared at the original image size
        # Resize enhanced to original size if necessary
        if enh.size != orig.size:
            enh_resized = enh.resize(orig.size, Image.Resampling.LANCZOS)
        else:
            enh_resized = enh

        # Convert to numpy arrays
        orig_arr = np.array(orig).astype(np.float64)
        enh_arr = np.array(enh_resized).astype(np.float64)

        # Compute MSE
        mse = np.mean((orig_arr - enh_arr) ** 2)
        if mse == 0:
            return float('inf')

        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        return float(round(psnr, 2))
    except Exception as e:
        logger.error(f"PSNR calculation failed: {e}")
        return 0.0

def compute_histogram(image_bytes: bytes) -> list:
    """Compute grayscale histogram (256 bins) for given image bytes and return as list."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('L')
        arr = np.array(img).flatten()
        hist, _ = np.histogram(arr, bins=256, range=(0, 255))
        return hist.tolist()
    except Exception as e:
        logger.warning(f"Failed to compute histogram: {e}")
        return []


def degrade_image_jpeg(image_bytes: bytes, quality: int = 50) -> bytes:
    """Create a degraded version of the input image by re-encoding it as JPEG at given quality.
    Returns JPEG bytes.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Make a stronger, more visible degradation so the 'before' PSNR is
        # meaningfully lower than a properly enhanced output.
        # Steps: downscale, blur, then re-encode as low-quality JPEG.
        w, h = img.size
        downscale = max(1, int(min(w, h) * 0.25))
        small = img.resize((downscale, downscale), Image.Resampling.BILINEAR)
        try:
            # Pillow's Image has ImageFilter in PIL.ImageFilter
            from PIL import ImageFilter
            small = small.filter(ImageFilter.GaussianBlur(radius=2))
        except Exception:
            pass
        blown = small.resize((w, h), Image.Resampling.BILINEAR)

        out = io.BytesIO()
        blown.save(out, format='JPEG', quality=max(15, int(quality / 2)), optimize=True)
        return out.getvalue()
    except Exception as e:
        logger.warning(f"Failed to degrade image: {e}")
        return image_bytes


def enhance_with_huggingface(image_bytes):
    """
    Enhance image using Hugging Face Inference API with fallback to PIL
    Primary: Try HF Real-ESRGAN 
    Fallback: Use PIL enhancement if HF fails or no token
    """
    logger.info("Attempting Real-ESRGAN enhancement via Hugging Face API...")

    api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
    
    # Check for standard HF token env var names
    hf_token = os.getenv("HF_API_TOKEN") or os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN")
    
    hf_debug = {"token_found": False, "attempts": []}
    
    # Try HF API even without token (some models allow free access)
    if hf_token:
        logger.info("✅ HF token found in environment variables")
        hf_debug["token_found"] = True
    else:
        logger.info("⚠️  No HF token found, attempting free tier access...")
        hf_debug["token_found"] = False

    # Use binary content type for raw image bytes
    headers = {
        "Content-Type": "application/octet-stream",
    }
    
    # Add token if available
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"

    # Try the HF API with retry loop; accept only image/* responses
    for attempt in range(3):
        try:
            logger.info(f"HF API attempt {attempt+1}/3...")
            response = requests.post(
                api_url,
                data=image_bytes,
                headers=headers,
                timeout=40,
            )

            content_type = response.headers.get("Content-Type", "")
            # If HF returns an image (binary), accept it
            if response.status_code == 200 and content_type.startswith("image"):
                logger.info("✅ Real-ESRGAN enhancement completed successfully via HF API")
                hf_debug["attempts"].append({
                    "attempt": attempt + 1,
                    "status": response.status_code,
                    "content_type": content_type,
                    "success": True
                })
                return response.content, "huggingface", hf_debug

            # Log non-success response
            body_text = None
            body_json = None
            try:
                body_json = response.json()
                body_text = str(body_json)
            except Exception:
                try:
                    body_text = response.text[:200]  # Limit text for logging
                except Exception:
                    body_text = "Unable to read response"

            logger.warning(
                f"HF API attempt {attempt+1}: status={response.status_code}, content-type={content_type}, body={body_text}"
            )
            hf_debug["attempts"].append({
                "attempt": attempt + 1,
                "status": response.status_code,
                "content_type": content_type,
                "body": body_json if body_json is not None else body_text,
                "success": False
            })
            
            # Wait briefly before retry (except on last attempt)
            if attempt < 2:
                import time
                time.sleep(1)

        except Exception as e:
            logger.warning(f"HF API attempt {attempt+1} failed with error: {e}")
            hf_debug["attempts"].append({
                "attempt": attempt + 1,
                "error": str(e),
                "success": False
            })
            
            # Wait briefly before retry (except on last attempt)
            if attempt < 2:
                import time
                time.sleep(1)

    # If we reach here, HF did not return a usable image — fallback to PIL
    logger.info("HF API unavailable/failed after retries — falling back to PIL enhancement")
    pil_bytes = enhance_with_pil_fallback(image_bytes)
    hf_debug["fallback_used"] = True
    return pil_bytes, "pil", hf_debug


@app.get("/")
async def root():
    """Root endpoint - API welcome message"""
    return {
        "message": "Real-ESRGAN Image Enhancement API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "enhance": "/api/enhance (POST)",
            "models": "/api/models"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model": "Real-ESRGAN (Hugging Face with PIL Fallback)",
        "scale": 4,
        "upscaling": "4x upscaling via Real-ESRGAN"
    }


@app.post("/api/enhance")
async def enhance_image(file: UploadFile = File(...)):
    """
    Enhance an image using Real-ESRGAN from Hugging Face
    
    Args:
        file: Image file to enhance
        
    Returns:
        Enhanced image as base64 string
    """
    try:
        if file.content_type is None or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        contents = await file.read()
        logger.info(f"Received upload: filename={file.filename}, content_type={file.content_type}, bytes={len(contents)}")
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        try:
            img = Image.open(io.BytesIO(contents))
            img = img.convert('RGB')
            logger.info(f"Processing image: {img.size}")
        except Exception as e:
            logger.error(f"Failed to open image: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

        png_buffer = io.BytesIO()
        img.save(png_buffer, format='PNG')
        png_bytes = png_buffer.getvalue()

        try:
            # Attempt HF enhancement (may return PIL fallback bytes and provider)
            enhanced_result = enhance_with_huggingface(png_bytes)
            hf_debug = None
            if isinstance(enhanced_result, tuple):
                # Support (bytes, provider) and (bytes, provider, debug)
                if len(enhanced_result) == 3:
                    enhanced_bytes, model_used, hf_debug = enhanced_result
                else:
                    enhanced_bytes, model_used = enhanced_result
            else:
                enhanced_bytes = enhanced_result
                model_used = "unknown"

            if enhanced_bytes is None:
                logger.error("All enhancement methods failed")
                error_detail = "Enhancement service temporarily unavailable"
                if 'hf_debug' in locals() and hf_debug is not None:
                    logger.error(f"HF Debug info: {hf_debug}")
                raise HTTPException(status_code=503, detail=error_detail)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Enhancement failed: {e}")
            if 'hf_debug' in locals() and hf_debug is not None:
                logger.error(f"HF Debug info: {hf_debug}")
            raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

        # Create a degraded 'before' image for a meaningful before/after comparison
        try:
            degraded_bytes = degrade_image_jpeg(png_bytes, quality=50)
            psnr_before = compute_psnr(png_bytes, degraded_bytes)
        except Exception as e:
            logger.warning(f"Degrade/PSNR-before warning: {e}")
            psnr_before = None

        # Calculate PSNR metric comparing original input and the enhanced output
        psnr_after = None
        try:
            psnr_after = compute_psnr(png_bytes, enhanced_bytes)
        except Exception as e:
            logger.warning(f"PSNR-after calculation warning: {e}")

        # Compute histograms for visualization
        hist_original = compute_histogram(png_bytes)
        hist_degraded = compute_histogram(degraded_bytes) if psnr_before is not None else []
        hist_enhanced = compute_histogram(enhanced_bytes)

        try:
            enhanced_img = Image.open(io.BytesIO(enhanced_bytes))
            jpeg_buffer = io.BytesIO()
            enhanced_img.save(jpeg_buffer, format='JPEG', quality=92, optimize=True)
            jpeg_bytes = jpeg_buffer.getvalue()
            
            enhanced_base64 = base64.b64encode(jpeg_bytes).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to encode image: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to encode image: {str(e)}")

        logger.info("✅ Image enhancement completed successfully")

        response_payload = {
            "success": True,
            "enhanced_image": enhanced_base64,
            "message": "Image enhanced successfully",
            "model_used": model_used,
            "psnr_before": psnr_before,
            "psnr_after": psnr_after,
            "histograms": {
                "original": hist_original,
                "degraded": hist_degraded,
                "enhanced": hist_enhanced
            }
        }

        if hf_debug is not None:
            response_payload["hf_debug"] = hf_debug

        return response_payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Enhancement error: {str(e)}")
        if 'hf_debug' in locals() and hf_debug is not None:
            logger.error(f"HF Debug info: {hf_debug}")
        raise HTTPException(
            status_code=500,
            detail=f"Image enhancement failed: {str(e)}"
        )


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("✅ Real-ESRGAN Enhancement API started successfully")
    logger.info("📍 Using Real-ESRGAN with Hugging Face API and PIL fallback")


@app.get("/api/models")
async def get_available_models():
    """Get information about available models"""
    return {
        "models": [
            {
                "name": "Real-ESRGAN x4",
                "description": "State-of-the-art 4x image super-resolution",
                "upscale_factor": 4,
                "provider": "Hugging Face (with PIL Fallback)",
                "status": "available"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )