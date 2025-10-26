import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestAPI = async () => {
    setIsLoading(true);
    try {
      toast.loading("Testing Gradio API connection...");

      const response = await fetch(
        "https://alexnasa-superresolution.hf.space/config"
      );

      if (response.ok) {
        toast.success("✅ Gradio API is online and ready!");
      } else {
        toast.error("❌ Failed to connect to Gradio API");
      }
    } catch (error) {
      toast.error("❌ Connection error. Check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="w-10" />
        </div>

        {/* API Status */}
        <div className="glass rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold">API Configuration</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              This app uses Hugging Face Gradio API for image enhancement. No API key required!
            </p>

            {/* API Info */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
              <div>
                <p className="font-semibold text-sm mb-1">Service</p>
                <p className="text-sm text-muted-foreground">
                  Hugging Face Gradio - alexnasa/SuperResolution
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Endpoint</p>
                <p className="text-sm text-muted-foreground font-mono">
                  /preprocess_n_magnify
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Status</p>
                <p className="text-sm text-green-600 font-semibold">✅ Ready</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <p className="font-semibold text-sm">Features:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>No authentication required</li>
                <li>Free to use (Hugging Face Spaces)</li>
                <li>Instant image enhancement</li>
                <li>Super-resolution upscaling</li>
                <li>AI-powered quality improvement</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleTestAPI}
              disabled={isLoading}
              className="flex-1 gradient-primary"
            >
              {isLoading ? "Testing..." : "Test API Connection"}
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="flex-1"
              variant="outline"
            >
              Back to Home
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-accent/10 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">About Hugging Face Spaces</p>
            <p className="text-xs text-muted-foreground">
              This app leverages free Hugging Face Spaces for image enhancement.
              Visit{" "}
              <a
                href="https://huggingface.co/spaces/alexnasa/SuperResolution"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                the model page
              </a>{" "}
              to learn more about the AI model used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
