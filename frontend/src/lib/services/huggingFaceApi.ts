/**
 * Hugging Face Gradio API Service for Image Enhancement
 * Uses the alexnasa/SuperResolution model via Gradio 
 * API: /preprocess_n_magnify endpoint
 */

const GRADIO_API_URL = "https://alexnasa-superresolution.hf.space";

export interface EnhancementResult {
  success: boolean;
  enhancedImage?: string;
  error?: string;
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("FileReader error"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Convert Blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("FileReader error"));
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * Poll for the enhanced image result
 */
async function pollForResult(
  hash: string,
  maxAttempts: number = 120
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${GRADIO_API_URL}/file=${hash}`, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        return await blobToBase64(blob);
      }
    } catch (error) {
      console.log(`Poll attempt ${attempt + 1} ...`);
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return null;
}

/**
 * Enhance an image using Hugging Face Gradio API (SuperResolution)
 */
export async function enhanceImageWithHuggingFace(
  imageInput: File | string
): Promise<EnhancementResult> {
  try {
    let base64Image: string;

    if (imageInput instanceof File) {
      base64Image = await fileToBase64(imageInput);
    } else {
      base64Image = imageInput;
    }

    const cleanBase64 = base64Image.includes(",")
      ? base64Image.split(",")[1]
      : base64Image;

    const formData = new FormData();
    const blob = base64ToBlob(cleanBase64, "image/jpeg");
    formData.append("data", blob, "image.jpg");

    console.log("Sending image to Gradio API...");

    const response = await fetch(
      `${GRADIO_API_URL}/call/preprocess_n_magnify`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${errorData}`
      );
    }

    const data = await response.json();
    const hash = data?.hash;

    if (!hash) {
      throw new Error("No processing hash returned from API");
    }

    console.log("Processing started, waiting for result...");

    const enhancedImage = await pollForResult(hash);

    if (!enhancedImage) {
      throw new Error("Failed to get enhanced image");
    }

    console.log("Enhancement complete!");

    return {
      success: true,
      enhancedImage: `data:image/jpeg;base64,${enhancedImage}`,
    };
  } catch (error) {
    console.error("Enhancement error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during enhancement",
    };
  }
}

/**
 * Batch enhance multiple images
 */
export async function batchEnhanceImages(
  images: (File | string)[]
): Promise<EnhancementResult[]> {
  return Promise.all(
    images.map((image) => enhanceImageWithHuggingFace(image))
  );
}

/**
 * Get enhancement progress estimate
 */
export function getProgressEstimate(imageSize: number): number {
  const baseDuration = 5000;
  const sizeMultiplier = imageSize / (1024 * 1024);
  return Math.min(baseDuration * (1 + sizeMultiplier), 120000);
}
