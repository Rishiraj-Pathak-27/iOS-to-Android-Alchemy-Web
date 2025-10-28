import { useState, useRef, useEffect } from "react";
import { Upload as UploadIcon, ArrowLeft, Download, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComparisonSlider from "@/components/ComparisonSlider";
import { galleryStorage } from "@/lib/galleryStorage";
import { enhanceImageWithRealESRGAN, checkBackendHealth } from "@/lib/services/realEsrganApi";

// Helper function to compress image for storage
const compressImageForStorage = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Scale down for storage (max 1500px to save space)
      const MAX_STORAGE_SIZE = 1500;
      let width = img.width;
      let height = img.height;

      if (width > MAX_STORAGE_SIZE || height > MAX_STORAGE_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_STORAGE_SIZE) / width);
          width = MAX_STORAGE_SIZE;
        } else {
          width = Math.round((width * MAX_STORAGE_SIZE) / height);
          height = MAX_STORAGE_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Use lower quality JPEG for storage compression
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = base64Image;
  });
};

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [psnrHF, setPsnrHF] = useState<number | null>(null);
  const [psnrPIL, setPsnrPIL] = useState<number | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toastRef = useRef<string | null>(null); // For tracking enhancement toast

  useEffect(() => {
    // Check if backend is available
    const checkBackend = async () => {
      const isHealthy = await checkBackendHealth();
      if (isHealthy) {
        toast.success("✅ Real-ESRGAN enhancement ready!");
      } else {
        toast.error("⚠️ Backend not available. Please start the backend server.");
      }
    };

    checkBackend();
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      // Validate file type with more specific message
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPEG, PNG, or WEBP)");
        return;
      }

      // Check file size with more user-friendly message
      const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB to support high-res images
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use an image under 25MB`);
        return;
      }

      // Clear any existing toast
      if (toastRef.current) {
        toast.dismiss(toastRef.current);
      }

      // Reset state and show loading
      setOriginalImage(null);
      setEnhancedImage(null);
      setIsEnhancing(true);
      
      // Create object URL for better performance with large images
      const objectUrl = URL.createObjectURL(file);
      
      // Pre-load image to ensure it's valid and get dimensions
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = objectUrl;
      });

      // Convert to base64 with proper sizing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Maintain aspect ratio while ensuring reasonable file size
      const MAX_DIMENSION = 3000;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // High-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Cleanup
      URL.revokeObjectURL(objectUrl);

      setOriginalImage(imageData);
      toast.success("Image loaded successfully!");
      
      // Auto-enhance
      await enhanceImage(imageData);
    } catch (error) {
      console.error("Error handling file:", error);
      toast.error("Failed to process image. Please try again.");
      reset();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const enhanceImage = async (imageData: string) => {
    if (!imageData) {
      toast.error("No image data available");
      return;
    }
    
  setIsEnhancing(true);
    setEnhancedImage(null);
  setModelUsed('attempting');

    const enhancementToast = toast.loading("🚀 Enhancing with Real-ESRGAN...");

    try {
      toast.loading("📤 Sending image to backend...", { id: enhancementToast });

      // Call Real-ESRGAN API to enhance the image
  const result = await enhanceImageWithRealESRGAN(imageData);

      if (!result.success || !result.enhancedImage) {
        throw new Error(result.error || "Enhancement failed");
      }

      toast.loading("✨ Processing enhancement...", { id: enhancementToast });

  const enhancedResult = result.enhancedImage;
  // Model and PSNR info (may be null)
  setModelUsed(result.modelUsed || null);
  setPsnrHF(result.psnrHF ?? null);
  setPsnrPIL(result.psnrPIL ?? null);
      setEnhancedImage(enhancedResult);

      // Save to gallery using localStorage
      toast.loading("💾 Saving to gallery...", { id: enhancementToast });
      try {
        // Compress original image for storage
        const compressedOriginal = await compressImageForStorage(imageData);
        
        galleryStorage.add({
          original_image_url: compressedOriginal,
          enhanced_image_url: enhancedResult,
          metadata: ({
            source: "manual_upload",
            enhancement: result.modelUsed || "unknown",
            psnr: {
              hf: result.psnrHF ?? null,
              pil: result.psnrPIL ?? null
            },
            timestamp: new Date().toISOString()
          } as any)
        });
        
        const storageInfo = galleryStorage.getStorageInfo();
        toast.success(
          `✅ Saved to gallery! (${storageInfo.count} items, ${storageInfo.estimatedSize}/${storageInfo.maxSize} used)`, 
          { id: enhancementToast }
        );
      } catch (storageError) {
        console.error("Failed to save to gallery:", storageError);
        const message = storageError instanceof Error ? storageError.message : "Gallery save failed due to storage limits";
        // Don't fail the entire enhancement if gallery save fails
        toast.warning(`✅ Enhancement complete! ⚠️ ${message}`, { 
          id: enhancementToast 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Enhancement failed";
      toast.error(`❌ ${errorMessage}`, { id: enhancementToast });
      console.error("Enhancement error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const downloadEnhanced = () => {
    if (enhancedImage) {
      try {
        // Create descriptive filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
        const filename = `enhanced_ios_style_${timestamp}.jpg`;
        
        // Create and trigger download
        const link = document.createElement("a");
        link.href = enhancedImage;
        link.download = filename;
        link.click();
        
        toast.success("Enhanced image downloaded successfully!", {
          description: `Saved as ${filename}`
        });
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download. Please try again.");
      }
    } else {
      toast.error("No enhanced image available to download");
    }
  };

  const reset = () => {
    // Clear all state
    setOriginalImage(null);
    setEnhancedImage(null);
    setIsEnhancing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Dismiss any active toasts
    if (toastRef.current) {
      toast.dismiss(toastRef.current);
      toastRef.current = null;
    }

    // Show ready state
    toast.info("Ready for a new image!");
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Upload & Enhance</h1>
          <div className="w-10" />
        </div>

        {/* Main Content */}
        {!originalImage ? (
          // Upload Area
          <div
            className={`glass rounded-3xl p-12 shadow-2xl transition-all duration-300 ${
              isDragging ? "border-4 border-primary scale-105" : "border-2 border-dashed border-border"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl gradient-primary mx-auto flex items-center justify-center shadow-glow">
                <ImagePlus className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Upload Your Photo</h2>
                <p className="text-muted-foreground text-lg">
                  Drag and drop or click to select an image
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="gradient-primary"
              >
                <UploadIcon className="w-5 h-5 mr-2" />
                Choose Image
              </Button>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP (Max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : isEnhancing ? (
          // Loading State
          <div className="glass rounded-3xl p-12 shadow-2xl">
            <div className="text-center space-y-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Enhancing Your Image</h2>
                <p className="text-muted-foreground">
                  Applying AI-powered iOS-quality enhancements...
                </p>
                {modelUsed === 'attempting' ? (
                  <p className="text-sm text-muted-foreground">Attempting Real-ESRGAN (Hugging Face)...</p>
                ) : modelUsed ? (
                  <p className="text-sm text-muted-foreground">Currently using: <strong>{modelUsed === 'huggingface' ? 'Real-ESRGAN' : 'PIL (fallback)'}</strong></p>
                ) : null}
              </div>
            </div>
          </div>
        ) : enhancedImage ? (
          // Comparison View
          <div className="space-y-6">
            <ComparisonSlider
              beforeImage={originalImage}
              afterImage={enhancedImage}
            />
            {/* PSNR Chart / Summary */}
            <div className="bg-muted p-4 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">Quality Comparison (PSNR)</h3>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1">
                  <div className="text-sm">Real-ESRGAN (HF)</div>
                  <div className="h-4 bg-gray-200 rounded overflow-hidden mt-1">
                    <div
                      className="h-4 bg-teal-500"
                      style={{ width: `${Math.min(((psnrHF ?? 0) / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{psnrHF ?? 'N/A'} dB</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm">PIL (Fallback)</div>
                  <div className="h-4 bg-gray-200 rounded overflow-hidden mt-1">
                    <div
                      className="h-4 bg-indigo-500"
                      style={{ width: `${Math.min(((psnrPIL ?? 0) / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{psnrPIL ?? 'N/A'} dB</div>
                </div>
              </div>
              {psnrHF !== null && psnrPIL !== null ? (
                <div className="text-sm">
                  Difference: <strong>{(((psnrHF - psnrPIL) / (psnrPIL || 1)) * 100).toFixed(1)}%</strong> ({psnrHF - psnrPIL} dB)
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Comparison data not available</div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={reset}
                className="flex-1 max-w-xs"
              >
                <UploadIcon className="w-5 h-5 mr-2" />
                New Image
              </Button>
              <Button
                size="lg"
                onClick={downloadEnhanced}
                className="flex-1 max-w-xs gradient-primary"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Upload;
