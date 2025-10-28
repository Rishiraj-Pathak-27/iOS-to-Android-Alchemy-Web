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
  histograms?: {
    original?: number[];
    degraded?: number[];
    enhanced?: number[];
  };
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
    console.log("🚀 Enhancement started. Backend URL:", ENHANCEMENT_ENDPOINT);
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
    console.log("📤 Sending request to backend...");
    const response = await fetch(ENHANCEMENT_ENDPOINT, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const errorMsg = errorData.detail || errorData.error || `Enhancement failed with status ${response.status}`;
      console.error("❌ Backend error:", errorMsg, errorData);
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log("✅ Backend response received:", { model_used: result.model_used, psnr_before: result.psnr_before, psnr_after: result.psnr_after });

    if (!result.enhanced_image) {
      console.error("❌ No enhanced image in response:", result);
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
      histograms: result.histograms || {},
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error during image enhancement";
    console.error("🔴 Image enhancement error:", errorMsg);
    return {
      success: false,
      error: errorMsg,
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
