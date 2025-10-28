/**
 * Real-ESRGAN API Service for Image Enhancement
 */

export interface EnhancementResult {
  success: boolean;
  enhancedImage?: string;
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

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const ENHANCEMENT_ENDPOINT = `${BACKEND_API_URL}/api/enhance`;

/**
 * Enhance image using Real-ESRGAN model via backend
 */
export async function enhanceImageWithRealESRGAN(
  imageFile: File | string
): Promise<EnhancementResult> {
  try {
    console.log("🚀 Enhancement started");
    const formData = new FormData();

    if (imageFile instanceof File) {
      formData.append("file", imageFile);
    } else {
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

    const response = await fetch(ENHANCEMENT_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      const errorMsg = errorData.detail || errorData.error || `Enhancement failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    const result = await response.json();
    if (!result.enhanced_image) {
      throw new Error("No enhanced image returned from backend");
    }

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
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Enhancement error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/health`, {method: "GET"});
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

export function getProgressEstimate(imageSize: number): number {
  const baseDuration = 3000;
  const sizeMultiplier = imageSize / (1024 * 1024);
  return Math.min(baseDuration * (1 + sizeMultiplier * 2), 45000);
}
