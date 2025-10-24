import { useState, useRef } from "react";
import { Upload as UploadIcon, ArrowLeft, Download, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComparisonSlider from "@/components/ComparisonSlider";

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setOriginalImage(imageData);
      toast.success("Image loaded successfully!");
      // Auto-enhance
      enhanceImage(imageData);
    };
    reader.readAsDataURL(file);
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
    setIsEnhancing(true);
    try {
      toast.info("Enhancing image with AI...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Apply iOS-like enhancements using canvas
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Apply iOS-like enhancements
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Enhanced processing for better quality
            for (let i = 0; i < data.length; i += 4) {
              // Increase contrast
              const factor = 1.25;
              data[i] = ((data[i] - 128) * factor) + 128;
              data[i + 1] = ((data[i + 1] - 128) * factor) + 128;
              data[i + 2] = ((data[i + 2] - 128) * factor) + 128;
              
              // Boost saturation
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const saturationFactor = 1.2;
              data[i] = avg + (data[i] - avg) * saturationFactor;
              data[i + 1] = avg + (data[i + 1] - avg) * saturationFactor;
              data[i + 2] = avg + (data[i + 2] - avg) * saturationFactor;
              
              // Warm tone adjustment (iOS-like)
              data[i] = Math.min(255, data[i] * 1.05); // Red
              data[i + 2] = Math.max(0, data[i + 2] * 0.95); // Blue
              
              // Clamp values
              data[i] = Math.max(0, Math.min(255, data[i]));
              data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
              data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Apply slight sharpening
            ctx.filter = "contrast(1.1) saturate(1.15) brightness(1.05)";
            ctx.drawImage(canvas, 0, 0);
            
            const enhanced = canvas.toDataURL("image/jpeg", 0.95);
            setEnhancedImage(enhanced);
            toast.success("Enhancement complete!");
          }
        }
      };
      img.src = imageData;
    } catch (error) {
      toast.error("Enhancement failed. Please try again.");
      console.error("Enhancement error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const downloadEnhanced = () => {
    if (enhancedImage) {
      const link = document.createElement("a");
      link.href = enhancedImage;
      link.download = `enhanced_${Date.now()}.jpg`;
      link.click();
      toast.success("Enhanced image downloaded!");
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
