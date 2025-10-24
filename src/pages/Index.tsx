import { useState } from "react";
import { Camera, Upload, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 glass px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Enhancement</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            iOS Alchemy
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your Android photos into stunning iOS-quality images using advanced AI enhancement
          </p>
        </div>

        {/* Options Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Camera Capture Option */}
          <div
            onClick={() => navigate("/capture")}
            className="group glass p-8 rounded-3xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-primary/30"
          >
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Camera Capture</h3>
            <p className="text-muted-foreground mb-4">
              Start your camera, capture a photo, and enhance it instantly with AI
            </p>
            <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
              Start Camera
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Manual Upload Option */}
          <div
            onClick={() => navigate("/upload")}
            className="group glass p-8 rounded-3xl cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-secondary/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Upload Image</h3>
            <p className="text-muted-foreground mb-4">
              Choose an image from your device and enhance it with iOS-quality processing
            </p>
            <div className="flex items-center text-secondary font-semibold group-hover:gap-3 gap-2 transition-all">
              Choose File
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="glass p-6 rounded-2xl">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">AI</div>
              <div className="text-sm text-muted-foreground">Powered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-1">Instant</div>
              <div className="text-sm text-muted-foreground">Enhancement</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">iOS</div>
              <div className="text-sm text-muted-foreground">Quality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
