"""
Real-ESRGAN Image Enhancement Backend
Using Real-ESRGAN model from Hugging Face for professional image upscaling
Built with FastAPI and Uvicorn
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
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

        # Resize original to enhanced size for fair comparison
        if orig.size != enh.size:
            orig_resized = orig.resize(enh.size, Image.Resampling.LANCZOS)
        else:
            orig_resized = orig

        # Convert to numpy arrays
        orig_arr = np.array(orig_resized).astype(np.float64)
        enh_arr = np.array(enh).astype(np.float64)

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


def enhance_with_huggingface(image_bytes):
    """
    Enhance image using Hugging Face Inference API with fallback
    """
    try:
        logger.info("Sending image to Hugging Face Real-ESRGAN model...")
        
        api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
        hf_token = os.getenv("HF_API_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")

        # If no HF token configured, immediately use PIL fallback
        if not hf_token:
            logger.info("No HF token found — using PIL fallback")
            pil_bytes = enhance_with_pil_fallback(image_bytes)
            return pil_bytes, "pil"

        headers = {
            "Content-Type": "image/png",
            "Authorization": f"Bearer {hf_token}"
        }

        response = requests.post(
            api_url,
            data=image_bytes,
            headers=headers,
            timeout=30
        )

        if response.status_code == 200:
            logger.info("✅ Real-ESRGAN enhancement completed via HF API")
            return response.content, "huggingface"
        else:
            logger.warning(f"⚠️ HF API returned {response.status_code}, using PIL fallback...")
            pil_bytes = enhance_with_pil_fallback(image_bytes)
            return pil_bytes, "pil"
            
    except Exception as e:
        logger.warning(f"⚠️ HF API error: {e}, using PIL fallback...")
        pil_bytes = enhance_with_pil_fallback(image_bytes)
        return pil_bytes, "pil"


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
            if isinstance(enhanced_result, tuple):
                enhanced_bytes, model_used = enhanced_result
            else:
                enhanced_bytes = enhanced_result
                model_used = "unknown"

            if enhanced_bytes is None:
                logger.error("All enhancement methods failed")
                raise HTTPException(status_code=503, detail="Enhancement service temporarily unavailable")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Enhancement failed: {e}")
            raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

        # Calculate PSNR metric comparing original input and the enhanced output
        psnr = None
        try:
            psnr = compute_psnr(png_bytes, enhanced_bytes)
        except Exception as e:
            logger.warning(f"PSNR calculation warning: {e}")

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

        return {
            "success": True,
            "enhanced_image": enhanced_base64,
            "message": "Image enhanced successfully",
            "model_used": model_used,
            "psnr": psnr
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Enhancement error: {str(e)}")
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



# """
# Real-ESRGAN Image Enhancement Backend with PSNR Metrics
# """

# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import base64
# import io
# import logging
# from PIL import Image
# import requests
# import os
# import numpy as np
# from typing import Dict, Tuple

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = FastAPI(title="Real-ESRGAN Image Enhancement API", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# def calculate_psnr(original_img: Image.Image, enhanced_img: Image.Image) -> float:
#     """
#     Calculate Peak Signal-to-Noise Ratio between original and enhanced images
#     Higher PSNR means better quality (typically 20-50 dB range)
#     """
#     try:
#         # Resize enhanced image to match original for comparison
#         enhanced_resized = enhanced_img.resize(original_img.size, Image.Resampling.LANCZOS)
        
#         # Convert to numpy arrays
#         orig_array = np.array(original_img).astype(np.float64)
#         enh_array = np.array(enhanced_resized).astype(np.float64)
        
#         # Calculate MSE (Mean Squared Error)
#         mse = np.mean((orig_array - enh_array) ** 2)
        
#         if mse == 0:
#             return float('inf')
        
#         # Calculate PSNR
#         max_pixel = 255.0
#         psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        
#         return round(psnr, 2)
#     except Exception as e:
#         logger.error(f"PSNR calculation error: {e}")
#         return 0.0


# def calculate_image_metrics(original_img: Image.Image, enhanced_img: Image.Image) -> Dict:
#     """
#     Calculate various image quality metrics
#     """
#     try:
#         psnr = calculate_psnr(original_img, enhanced_img)
        
#         # Calculate size increase
#         orig_size = original_img.size
#         enh_size = enhanced_img.size
#         scale_factor = enh_size[0] / orig_size[0]
        
#         # Calculate sharpness (using edge detection approximation)
#         enhanced_gray = enhanced_img.convert('L')
#         enh_array = np.array(enhanced_gray)
        
#         # Laplacian variance as sharpness metric
#         laplacian = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
#         from scipy import ndimage
#         edges = ndimage.convolve(enh_array.astype(float), laplacian)
#         sharpness = np.var(edges)
        
#         return {
#             "psnr": psnr,
#             "original_size": f"{orig_size[0]}x{orig_size[1]}",
#             "enhanced_size": f"{enh_size[0]}x{enh_size[1]}",
#             "scale_factor": round(scale_factor, 2),
#             "sharpness_score": round(sharpness, 2),
#             "quality_grade": get_quality_grade(psnr)
#         }
#     except Exception as e:
#         logger.error(f"Metrics calculation error: {e}")
#         # Return basic metrics without scipy-dependent sharpness
#         return {
#             "psnr": psnr,
#             "original_size": f"{orig_size[0]}x{orig_size[1]}",
#             "enhanced_size": f"{enh_size[0]}x{enh_size[1]}",
#             "scale_factor": round(scale_factor, 2),
#             "quality_grade": get_quality_grade(psnr)
#         }


# def get_quality_grade(psnr: float) -> str:
#     """
#     Convert PSNR value to quality grade
#     """
#     if psnr >= 40:
#         return "Excellent"
#     elif psnr >= 35:
#         return "Very Good"
#     elif psnr >= 30:
#         return "Good"
#     elif psnr >= 25:
#         return "Fair"
#     else:
#         return "Poor"


# def enhance_with_pil_fallback(image_bytes):
#     """
#     Fallback enhancement using PIL when APIs are unavailable
#     Provides 2x upscaling with quality improvements
#     """
#     try:
#         logger.info("Using PIL-based fallback enhancement...")
        
#         img = Image.open(io.BytesIO(image_bytes))
#         img = img.convert('RGB')
        
#         original_width, original_height = img.size
#         logger.info(f"Original dimensions: {original_width}x{original_height}")
        
#         new_size = (original_width * 2, original_height * 2)
#         img = img.resize(new_size, Image.Resampling.LANCZOS)
        
#         from PIL import ImageEnhance, ImageFilter
        
#         enhancer = ImageEnhance.Sharpness(img)
#         img = enhancer.enhance(2.0)
        
#         enhancer = ImageEnhance.Contrast(img)
#         img = enhancer.enhance(1.3)
        
#         enhancer = ImageEnhance.Color(img)
#         img = enhancer.enhance(1.1)
        
#         img = img.filter(ImageFilter.SMOOTH_MORE)
        
#         output = io.BytesIO()
#         img.save(output, format='PNG', optimize=False)
#         result_bytes = output.getvalue()
        
#         logger.info(f"✅ PIL enhancement completed: {new_size[0]}x{new_size[1]}")
#         return result_bytes
        
#     except Exception as e:
#         logger.error(f"PIL fallback error: {e}")
#         return None


# def enhance_with_huggingface(image_bytes):
#     """
#     Enhance image using Hugging Face Inference API with fallback
#     """
#     try:
#         logger.info("Sending image to Hugging Face Real-ESRGAN model...")
        
#         api_url = "https://api-inference.huggingface.co/models/qualcomm/Real-ESRGAN-x4plus"
        
#         hf_token = os.getenv("HF_API_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
#         headers = {
#             "Content-Type": "image/png"
#         }
        
#         if hf_token:
#             headers["Authorization"] = f"Bearer {hf_token}"
        
#         response = requests.post(
#             api_url,
#             data=image_bytes,
#             headers=headers,
#             timeout=30
#         )
        
#         if response.status_code == 200:
#             logger.info("✅ Real-ESRGAN enhancement completed via HF API")
#             return response.content
#         elif response.status_code == 401:
#             logger.info("⚠️ HF API auth skipped (no token configured), using PIL fallback...")
#             return enhance_with_pil_fallback(image_bytes)
#         else:
#             logger.warning(f"⚠️ HF API returned {response.status_code}, using PIL fallback...")
#             return enhance_with_pil_fallback(image_bytes)
            
#     except Exception as e:
#         logger.warning(f"⚠️ HF API error: {e}, using PIL fallback...")
#         return enhance_with_pil_fallback(image_bytes)


# @app.get("/")
# async def root():
#     """Root endpoint - API welcome message"""
#     return {
#         "message": "Real-ESRGAN Image Enhancement API",
#         "version": "1.0.0",
#         "status": "running",
#         "endpoints": {
#             "health": "/health",
#             "enhance": "/api/enhance (POST)",
#             "models": "/api/models"
#         }
#     }


# @app.get("/health")
# async def health_check():
#     """Health check endpoint"""
#     return {
#         "status": "ok",
#         "model": "Real-ESRGAN (Hugging Face with PIL Fallback)",
#         "scale": 4,
#         "upscaling": "4x upscaling via Real-ESRGAN"
#     }


# @app.post("/api/enhance")
# async def enhance_image(file: UploadFile = File(...)):
#     """
#     Enhance an image using Real-ESRGAN from Hugging Face
#     Returns enhanced image with PSNR metrics
    
#     Args:
#         file: Image file to enhance
        
#     Returns:
#         Enhanced image as base64 string with quality metrics
#     """
#     try:
#         if file.content_type is None or not file.content_type.startswith("image/"):
#             raise HTTPException(status_code=400, detail="File must be an image")

#         contents = await file.read()
        
#         if not contents:
#             raise HTTPException(status_code=400, detail="Empty file uploaded")

#         try:
#             original_img = Image.open(io.BytesIO(contents))
#             original_img = original_img.convert('RGB')
#             logger.info(f"Processing image: {original_img.size}")
#         except Exception as e:
#             logger.error(f"Failed to open image: {e}")
#             raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

#         # Convert to PNG for processing
#         png_buffer = io.BytesIO()
#         original_img.save(png_buffer, format='PNG')
#         png_bytes = png_buffer.getvalue()

#         try:
#             enhanced_bytes = enhance_with_huggingface(png_bytes)
            
#             if enhanced_bytes is None:
#                 logger.error("All enhancement methods failed")
#                 raise HTTPException(status_code=503, detail="Enhancement service temporarily unavailable")
            
#         except HTTPException:
#             raise
#         except Exception as e:
#             logger.error(f"Enhancement failed: {e}")
#             raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

#         try:
#             enhanced_img = Image.open(io.BytesIO(enhanced_bytes))
            
#             # Calculate metrics BEFORE converting to JPEG
#             metrics = calculate_image_metrics(original_img, enhanced_img)
            
#             # Convert to JPEG for response
#             jpeg_buffer = io.BytesIO()
#             enhanced_img.save(jpeg_buffer, format='JPEG', quality=92, optimize=True)
#             jpeg_bytes = jpeg_buffer.getvalue()
            
#             enhanced_base64 = base64.b64encode(jpeg_bytes).decode("utf-8")
#         except Exception as e:
#             logger.error(f"Failed to encode image: {e}")
#             raise HTTPException(status_code=500, detail=f"Failed to encode image: {str(e)}")

#         logger.info(f"✅ Image enhancement completed - PSNR: {metrics['psnr']} dB")

#         return {
#             "success": True,
#             "enhanced_image": enhanced_base64,
#             "message": "Image enhanced successfully with 4x upscaling",
#             "metrics": metrics
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"❌ Enhancement error: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Image enhancement failed: {str(e)}"
#         )


# @app.on_event("startup")
# async def startup_event():
#     """Initialize on startup"""
#     logger.info("✅ Real-ESRGAN Enhancement API started successfully")
#     logger.info("📍 Using Real-ESRGAN with Hugging Face API and PIL fallback")


# @app.get("/api/models")
# async def get_available_models():
#     """Get information about available models"""
#     return {
#         "models": [
#             {
#                 "name": "Real-ESRGAN x4",
#                 "description": "State-of-the-art 4x image super-resolution",
#                 "upscale_factor": 4,
#                 "provider": "Hugging Face (with PIL Fallback)",
#                 "status": "available"
#             }
#         ]
#     }


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(
#         app,
#         host="0.0.0.0",
#         port=8000,
#         log_level="info"
#     )