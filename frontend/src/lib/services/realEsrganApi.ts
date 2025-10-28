/**
 * Real-ESRGAN API Service for Image Enhancement
 * Uses Gradio client to call the Real-ESRGAN model
 * Model: Real-ESRGAN (state-of-the-art image super-resolution)
 */

export interface EnhancementResult {
  success: boolean;
  enhancedImage?: string; // base64 encoded image
  error?: string;
  modelUsed?: string | null;
  psnr_before?: number | null;
  psnr_after?: number | null;
}

/**
 * Backend endpoint for image enhancement
 * The backend will handle the Real-ESRGAN processing
 */
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const ENHANCEMENT_ENDPOINT = `${BACKEND_API_URL}/api/enhance`;

/**
 * Enhance an image using Real-ESRGAN model via backend
 * @param imageFile - File object or base64 string
 * @returns Enhanced image as base64 string
 */
export async function enhanceImageWithRealESRGAN(
  imageFile: File | string
): Promise<EnhancementResult> {
  try {
    const formData = new FormData();

    if (imageFile instanceof File) {
      formData.append("file", imageFile);
    } else {
      // Convert base64 to File
      const base64Data = imageFile.includes(",")
        ? imageFile.split(",")[1]
        : imageFile;

      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "image/jpeg" });
      formData.append("file", blob, "image.jpg");
    }

    // Call backend API
    const response = await fetch(ENHANCEMENT_ENDPOINT, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Enhancement failed with status ${response.status}`,
      }));
      throw new Error(errorData.error || "Image enhancement failed");
    }

    const result = await response.json();

    if (!result.enhanced_image) {
      throw new Error("No enhanced image returned from backend");
    }

    // Ensure the image data is properly formatted as base64
    const enhancedImage = result.enhanced_image.startsWith("data:")
      ? result.enhanced_image
      : `data:image/jpeg;base64,${result.enhanced_image}`;

    return {
      success: true,
      enhancedImage,
      modelUsed: result.model_used || null,
      psnr_before: typeof result.psnr_before === 'number' ? result.psnr_before : null,
      psnr_after: typeof result.psnr_after === 'number' ? result.psnr_after : null,
    };
  } catch (error) {
    console.error("Image enhancement error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during image enhancement",
    };
  }
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}

/**
 * Get enhancement progress estimate based on image size
 */
export function getProgressEstimate(imageSize: number): number {
  // Estimate based on file size
  const baseDuration = 3000; // 3 seconds base
  const sizeMultiplier = imageSize / (1024 * 1024); // Convert to MB
  return Math.min(baseDuration * (1 + sizeMultiplier * 2), 45000); // Max 45 seconds
}
