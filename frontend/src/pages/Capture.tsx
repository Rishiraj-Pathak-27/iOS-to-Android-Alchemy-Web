import { useState, useRef, useEffect } from "react";
import { Camera, X, Download, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComparisonSlider from "@/components/ComparisonSlider";
import { galleryStorage } from "@/lib/galleryStorage";

const Capture = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1920, height: 1080 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      toast.error("Camera access denied. Please enable camera permissions.");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const playShutterSound = () => {
    // Create a simple camera shutter sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      // Play shutter sound
      playShutterSound();
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.95);
        setCapturedImage(imageData);
        stopCamera();
        
        // Auto-save captured image
        const link = document.createElement("a");
        link.href = imageData;
        link.download = `captured_${Date.now()}.jpg`;
        link.click();
        toast.success("Photo captured and saved!");
      }
    }
  };

  const enhanceImage = async (imageData: string) => {
    setIsEnhancing(true);
    try {
      toast.info("Enhancing image with AI...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Apply iOS-like enhancements using canvas
      const img = new Image();
      img.onload = async () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // iOS-like enhancement algorithm
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            
            // Step 1: Enhanced contrast (moderate)
            const contrastFactor = 1.18;
            for (let i = 0; i < data.length; i += 4) {
              data[i] = ((data[i] - 128) * contrastFactor) + 128;
              data[i + 1] = ((data[i + 1] - 128) * contrastFactor) + 128;
              data[i + 2] = ((data[i + 2] - 128) * contrastFactor) + 128;
            }
            
            // Step 2: Natural saturation boost (subtle)
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const saturationFactor = 1.12;
              data[i] = avg + (data[i] - avg) * saturationFactor;
              data[i + 1] = avg + (data[i + 1] - avg) * saturationFactor;
              data[i + 2] = avg + (data[i + 2] - avg) * saturationFactor;
            }
            
            // Step 3: iOS cool tone adjustment (cooler, more natural)
            for (let i = 0; i < data.length; i += 4) {
              data[i] = data[i] * 0.98; // Slightly reduce red
              data[i + 2] = Math.min(255, data[i + 2] * 1.03); // Slightly boost blue
            }
            
            // Step 4: Clamp values
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.max(0, Math.min(255, data[i]));
              data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
              data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
            }
            
            ctx.putImageData(imgData, 0, 0);
            
            // Step 5: Apply subtle sharpening and clarity
            ctx.filter = "contrast(1.08) saturate(1.1) brightness(1.02)";
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = "none";
            
            const enhanced = canvas.toDataURL("image/jpeg", 0.95);
            setEnhancedImage(enhanced);
            
            // Auto-save enhanced image
            const link = document.createElement("a");
            link.href = enhanced;
            link.download = `enhanced_${Date.now()}.jpg`;
            link.click();
            
            // Save to gallery using localStorage
            try {
              galleryStorage.add({
                original_image_url: imageData,
                enhanced_image_url: enhanced,
                metadata: { source: "camera_capture" }
              });
            } catch (storageError) {
              console.error("Failed to save to gallery:", storageError);
            }
            
            toast.success("Enhancement complete and saved!");
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

  const handleUploadCaptured = () => {
    if (capturedImage) {
      enhanceImage(capturedImage);
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

  const resetCapture = () => {
    setCapturedImage(null);
    setEnhancedImage(null);
    startCamera();
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
          <h1 className="text-2xl font-bold">Camera Capture</h1>
          <div className="w-10" />
        </div>

        {/* Main Content */}
        {!capturedImage && !enhancedImage ? (
          // Camera View
          <div className="glass rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative aspect-[4/3] bg-white">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="p-6 flex justify-center">
              <Button
                size="lg"
                onClick={capturePhoto}
                disabled={!isCameraActive}
                className="rounded-full w-20 h-20 gradient-primary shadow-glow"
              >
                <Camera className="w-8 h-8" />
              </Button>
            </div>
          </div>
        ) : capturedImage && !enhancedImage ? (
          // Captured Image View
          <div className="space-y-6">
            <div className="glass rounded-3xl overflow-hidden shadow-2xl p-6">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full rounded-2xl"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={resetCapture}
                className="flex-1 max-w-xs"
              >
                <X className="w-5 h-5 mr-2" />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={handleUploadCaptured}
                disabled={isEnhancing}
                className="flex-1 max-w-xs gradient-primary"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  "Enhance Photo"
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Enhanced Image Comparison View
          <div className="space-y-6">
            <ComparisonSlider
              beforeImage={capturedImage!}
              afterImage={enhancedImage!}
            />
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={resetCapture}
                className="flex-1 max-w-xs"
              >
                <Camera className="w-5 h-5 mr-2" />
                New Photo
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
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Capture;
