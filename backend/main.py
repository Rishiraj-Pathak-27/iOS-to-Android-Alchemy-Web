"""
Real-ESRGAN Image Enhancement Backend
Using Python image processing to enhance images
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
from PIL import Image, ImageEnhance, ImageFilter
import logging
import os
import numpy as np
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Image Enhancement API", version="1.0.0")

# Add CORS middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def enhance_image_quality(image: Image.Image) -> Image.Image:
    """
    Enhance image quality using PIL filters
    Mimics upscaling and quality improvement
    """
    try:
        # Step 1: Resize to simulate 4x upscaling
        width, height = image.size
        new_size = (width * 2, height * 2)
        
        # Use LANCZOS resampling for quality upscaling
        enhanced = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Step 2: Enhance sharpness
        sharpener = ImageEnhance.Sharpness(enhanced)
        enhanced = sharpener.enhance(1.5)
        
        # Step 3: Enhance contrast
        contrast = ImageEnhance.Contrast(enhanced)
        enhanced = contrast.enhance(1.2)
        
        # Step 4: Enhance color
        color = ImageEnhance.Color(enhanced)
        enhanced = color.enhance(1.1)
        
        # Step 5: Reduce noise with median filter
        enhanced = enhanced.filter(ImageFilter.MedianFilter(size=3))
        
        # Step 6: Slight brightness adjustment
        brightness = ImageEnhance.Brightness(enhanced)
        enhanced = brightness.enhance(1.05)
        
        logger.info(f"✅ Enhanced image: {image.size} -> {enhanced.size}")
        return enhanced
        
    except Exception as e:
        logger.error(f"Error during enhancement: {e}")
        raise


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model": "Enhanced PIL Image Processor",
        "version": "1.0.0"
    }


@app.post("/api/enhance")
async def enhance_image(file: UploadFile = File(...)):
    """
    Enhance an image using PIL image processing
    
    Args:
        file: Image file to enhance
        
    Returns:
        Enhanced image as base64 string
    """
    try:
        # Check file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read file contents
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Validate and open image
        try:
            img = Image.open(io.BytesIO(contents))
            img = img.convert('RGB')  # Convert to RGB if needed
            logger.info(f"Processing image: {img.size} - {img.format}")
        except Exception as e:
            logger.error(f"Failed to open image: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

        # Enhance the image
        try:
            enhanced = enhance_image_quality(img)
        except Exception as e:
            logger.error(f"Enhancement failed: {e}")
            raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

        # Convert enhanced image to base64
        try:
            output_buffer = io.BytesIO()
            enhanced.save(output_buffer, format='JPEG', quality=95)
            enhanced_bytes = output_buffer.getvalue()
            enhanced_base64 = base64.b64encode(enhanced_bytes).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to encode image: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to encode image: {str(e)}")

        logger.info("✅ Image enhancement completed successfully")

        return {
            "success": True,
            "enhanced_image": enhanced_base64,
            "message": "Image enhanced successfully"
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
    logger.info("✅ Image Enhancement API started successfully")


@app.get("/api/models")
async def get_available_models():
    """Get information about available models"""
    return {
        "models": [
            {
                "name": "PIL Image Processor",
                "description": "Enhanced image processing with upscaling, sharpening, and noise reduction",
                "upscale_factor": 2,
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
