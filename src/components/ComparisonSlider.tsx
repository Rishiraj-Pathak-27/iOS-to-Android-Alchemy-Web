import { useState, useRef } from "react";
import { MoveHorizontal } from "lucide-react";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

const ComparisonSlider = ({ beforeImage, afterImage }: ComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  return (
    <div className="glass rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-sm text-muted-foreground mb-1">Original</div>
            <div className="text-xs text-muted-foreground">Android Photo</div>
          </div>
          <div className="px-4">
            <div className="w-px h-8 bg-border" />
          </div>
          <div className="text-center flex-1">
            <div className="text-sm font-semibold text-primary mb-1">Enhanced</div>
            <div className="text-xs text-primary">iOS Quality</div>
          </div>
        </div>
      </div>
      
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden cursor-ew-resize select-none bg-white"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Enhanced) */}
        <img
          src={afterImage}
          alt="Enhanced"
          className="absolute inset-0 w-full h-full object-contain bg-white"
          draggable={false}
          style={{ imageRendering: 'auto' }}
          loading="eager"
        />
        
        {/* Before Image (Original) with clip */}
        <div
          className="absolute inset-0 overflow-hidden backdrop-blur-sm"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain bg-white"
            draggable={false}
            loading="eager"
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg cursor-ew-resize backdrop-blur-sm"
          style={{ 
            left: `${sliderPosition}%`, 
            transform: "translateX(-50%)",
            boxShadow: "0 0 15px rgba(255,255,255,0.5)"
          }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center">
            <MoveHorizontal className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 glass px-3 py-1 rounded-full text-xs font-semibold">
          Before
        </div>
        <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-full text-xs font-semibold text-primary">
          After
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
