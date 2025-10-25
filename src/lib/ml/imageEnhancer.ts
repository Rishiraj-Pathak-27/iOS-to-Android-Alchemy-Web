import * as tf from '@tensorflow/tfjs';

// iOS-style processing parameters
const IOS_PARAMS = {
  exposure: 1.15,     // Brighter exposure for iOS look
  contrast: 1.12,     // Balanced contrast
  vibrance: 1.25,     // Strong color vibrance
  shadows: 1.2,       // Significantly lifted shadows
  highlights: 0.92,   // Protected highlights
  clarity: 1.15,      // Enhanced local contrast
  sharpness: 1.3,     // iOS-like sharpness
  warmth: 1.03,       // Slightly warm
  saturation: 1.15,   // Rich but natural colors
  noise: 0.85,        // Strong noise reduction
  smart_tone: 1.1,    // Smart tone mapping
  white_point: 1.02   // Bright white point
};

// Initialize TensorFlow with WebGL backend for better performance
import '@tensorflow/tfjs-backend-webgl';

export class ImageEnhancer {
  private isModelLoaded = false;

  constructor() {
    this.initModel();
  }

  private async initModel() {
    try {
      // Initialize TensorFlow.js with WebGL backend for advanced operations
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow.js initialized with backend:', tf.getBackend());
      
      this.isModelLoaded = true;
      console.log('Image enhancement system initialized');
    } catch (error) {
      console.error('Failed to initialize TensorFlow:', error);
      // Fallback to CPU backend
      console.log('Falling back to canvas-only enhancement');
      this.isModelLoaded = true; // Still mark as loaded, we'll use canvas fallback
    }
  }

  public async enhanceImage(
    originalImageData: ImageData,
    progressCallback?: (progress: number) => void
  ): Promise<ImageData> {
    try {
      // Report initial progress
      progressCallback?.(0.1);

      const width = originalImageData.width;
      const height = originalImageData.height;

      // Create working canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw original image
      ctx.putImageData(originalImageData, 0, 0);
      progressCallback?.(0.2);

      // Step 1: Initial iOS-like adjustments using canvas filters
      ctx.filter = `
        brightness(${IOS_PARAMS.exposure})
        contrast(${IOS_PARAMS.contrast})
        saturate(${IOS_PARAMS.saturation})
      `;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';
      progressCallback?.(0.3);

      // Step 2: Advanced pixel manipulation for iOS characteristics
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      
      progressCallback?.(0.4);

      // Apply shadow lifting and highlight protection
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Shadow lifting (brighten dark areas)
        if (luminance < 128) {
          const lift = (128 - luminance) / 128 * (IOS_PARAMS.shadows - 1) * 20;
          data[i] = Math.min(255, r + lift);
          data[i + 1] = Math.min(255, g + lift);
          data[i + 2] = Math.min(255, b + lift);
        }
        
        // Highlight protection (slightly reduce bright areas)
        if (luminance > 200) {
          const protect = (luminance - 200) / 55 * (1 - IOS_PARAMS.highlights) * 15;
          data[i] = Math.max(0, r - protect);
          data[i + 1] = Math.max(0, g - protect);
          data[i + 2] = Math.max(0, b - protect);
        }
      }
      
      progressCallback?.(0.6);

      // Apply vibrance boost (more intelligent than saturation)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        
        // Only boost less saturated colors (vibrance effect)
        if (saturation < 0.5) {
          const avg = (r + g + b) / 3;
          const vibranceFactor = 1 + ((1 - saturation) * (IOS_PARAMS.vibrance - 1) * 0.3);
          data[i] = avg + (r - avg) * vibranceFactor;
          data[i + 1] = avg + (g - avg) * vibranceFactor;
          data[i + 2] = avg + (b - avg) * vibranceFactor;
        }
      }

      progressCallback?.(0.7);

      // Apply warmth adjustment
      for (let i = 0; i < data.length; i += 4) {
        data[i] = data[i] * IOS_PARAMS.warmth; // Warm up reds
        data[i + 2] = data[i + 2] / IOS_PARAMS.warmth; // Cool down blues slightly
      }

      // Clamp all values
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
      }

      ctx.putImageData(imgData, 0, 0);
      progressCallback?.(0.8);

      // Step 3: Apply sharpening for iOS clarity
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.filter = 'contrast(1.08) brightness(1.02)';
        tempCtx.drawImage(canvas, 0, 0);
        
        // Blend with original for subtle sharpening
        ctx.globalAlpha = 0.4;
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      progressCallback?.(0.9);

      // Final white point adjustment
      ctx.filter = `brightness(${IOS_PARAMS.white_point})`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = 'none';

      progressCallback?.(1.0);

      return ctx.getImageData(0, 0, width, height);
    } catch (error) {
      console.error('Error during enhancement:', error);
      throw error;
    }
  }

  public async warmupModel() {
    if (!this.isModelLoaded) {
      await this.initModel();
    }
    console.log('Image enhancer ready');
  }
}

// Singleton instance
export const imageEnhancer = new ImageEnhancer();