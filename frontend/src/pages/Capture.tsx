import { useState, useRef, useEffect } from "react";
import { Camera, X, Download, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComparisonSlider from "@/components/ComparisonSlider";
import { galleryStorage } from "@/lib/galleryStorage";
import { enhanceImageWithRealESRGAN } from "@/lib/services/realEsrganApi";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip as ChartTooltip, Legend } from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

interface QualityMetrics {
  psnr_before: number | null;
  psnr_after: number | null;
  model_used: string;
  histograms?: {
    original?: number[];
    degraded?: number[];
    enhanced?: number[];
  };
}

const Capture = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
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
      console.log("🎬 Starting enhancement...");
      toast.info("Enhancing image via backend...");

      // Call the API service which handles CORS and backend URL correctly
      console.log("📞 Calling enhanceImageWithRealESRGAN service...");
      const result = await enhanceImageWithRealESRGAN(imageData);

      if (!result.success || !result.enhancedImage) {
        console.error("❌ Enhancement failed:", result.error);
        toast.error(`Enhancement failed: ${result.error || "Unknown error"}`);
        return;
      }

      console.log("✅ Enhancement successful:", { model: result.modelUsed, psnr_after: result.psnr_after });
      setEnhancedImage(result.enhancedImage);

      // Store quality metrics
      setQualityMetrics({
        psnr_before: result.psnr_before ?? null,
        psnr_after: result.psnr_after ?? null,
        model_used: result.modelUsed ?? "unknown",
        histograms: result.histograms,
      });

      // Save to gallery with PSNR history and model info
      try {
        const psnrHistoryEntry = {
          timestamp: new Date().toISOString(),
          psnr_before: result.psnr_before ?? null,
          psnr_after: result.psnr_after ?? null,
          model: result.modelUsed ?? "unknown",
        };

        galleryStorage.add({
          original_image_url: imageData,
          enhanced_image_url: result.enhancedImage,
          metadata: {
            source: "camera_capture",
            psnr_history: [psnrHistoryEntry],
            model_used: result.modelUsed,
            histograms: result.histograms,
          } as any
        });
      } catch (storageError) {
        console.error("⚠️  Failed to save to gallery:", storageError);
      }

      toast.success("Enhancement complete and saved to gallery!");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Enhancement error:", errorMsg);
      toast.error("Enhancement failed. Please try again.");
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
    setQualityMetrics(null);
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
          // Enhanced Image Comparison View with Quality Metrics
          <div className="space-y-6">
            <ComparisonSlider
              beforeImage={capturedImage!}
              afterImage={enhancedImage!}
            />

            {/* Quality Metrics Graphs */}
            {qualityMetrics && (
              <div className="glass rounded-3xl p-8 space-y-6 shadow-2xl">
                {/* PSNR Comparison Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* PSNR Values */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">PSNR Comparison (dB)</h3>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                      <p className="text-gray-600 text-sm mb-2">Before (Degraded)</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {qualityMetrics.psnr_before?.toFixed(2) ?? "N/A"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                      <p className="text-gray-600 text-sm mb-2">After (Enhanced)</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {qualityMetrics.psnr_after?.toFixed(2) ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* PSNR Bar Chart */}
                  <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6">
                    {qualityMetrics.psnr_before !== null && qualityMetrics.psnr_after !== null ? (
                      <Bar
                        data={{
                          labels: ["Before (Degraded)", "After (Enhanced)"],
                          datasets: [
                            {
                              label: "PSNR (dB)",
                              data: [qualityMetrics.psnr_before, qualityMetrics.psnr_after],
                              backgroundColor: ["#FB923C", "#3B82F6"],
                              borderRadius: 8,
                            },
                          ],
                        }}
                        options={{
                          indexAxis: "y",
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            x: {
                              beginAtZero: true,
                              max: Math.max(qualityMetrics.psnr_before, qualityMetrics.psnr_after) + 5,
                            },
                          },
                        }}
                      />
                    ) : (
                      <p className="text-gray-500">No PSNR data available</p>
                    )}
                  </div>
                </div>

                {/* Histogram Display */}
                {qualityMetrics.histograms && (
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-lg">Frequency Distribution (Grayscale)</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Before Histogram */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 mb-3">Before (Degraded)</p>
                        {qualityMetrics.histograms.degraded && qualityMetrics.histograms.degraded.length > 0 ? (
                          <Line
                            data={{
                              labels: Array.from({ length: 256 }, (_, i) => i),
                              datasets: [
                                {
                                  label: "Grayscale Distribution",
                                  data: qualityMetrics.histograms.degraded,
                                  borderColor: "#FB923C",
                                  backgroundColor: "rgba(251, 146, 60, 0.1)",
                                  tension: 0.4,
                                  borderWidth: 2,
                                  pointRadius: 0,
                                  fill: true,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: { legend: { display: false } },
                              scales: {
                                x: { display: false },
                                y: { beginAtZero: true },
                              },
                            }}
                          />
                        ) : (
                          <p className="text-gray-500 text-sm">No histogram data</p>
                        )}
                      </div>

                      {/* After Histogram */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 mb-3">After (Enhanced)</p>
                        {qualityMetrics.histograms.enhanced && qualityMetrics.histograms.enhanced.length > 0 ? (
                          <Line
                            data={{
                              labels: Array.from({ length: 256 }, (_, i) => i),
                              datasets: [
                                {
                                  label: "Grayscale Distribution",
                                  data: qualityMetrics.histograms.enhanced,
                                  borderColor: "#3B82F6",
                                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                                  tension: 0.4,
                                  borderWidth: 2,
                                  pointRadius: 0,
                                  fill: true,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: true,
                              plugins: { legend: { display: false } },
                              scales: {
                                x: { display: false },
                                y: { beginAtZero: true },
                              },
                            }}
                          />
                        ) : (
                          <p className="text-gray-500 text-sm">No histogram data</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
