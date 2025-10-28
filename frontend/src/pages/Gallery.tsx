import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComparisonSlider from "@/components/ComparisonSlider";
import { galleryStorage } from "@/lib/galleryStorage";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface GalleryItem {
  id: string;
  original_image_url: string;
  enhanced_image_url: string;
  created_at: string;
  metadata: any;
}

const Gallery = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const data = galleryStorage.getAll();
      setItems(data);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const success = galleryStorage.delete(id);
      if (!success) throw new Error("Delete failed");
      
      setItems(items.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      toast.success("Image deleted from gallery");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete image");
    }
  };

  if (selectedItem) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedItem(null)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">View Image</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteItem(selectedItem.id)}
              className="rounded-full text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>

          <ComparisonSlider
            beforeImage={selectedItem.original_image_url}
            afterImage={selectedItem.enhanced_image_url}
          />

          {/* PSNR history chart */}
          {selectedItem.metadata?.psnr_history && selectedItem.metadata.psnr_history.length > 0 ? (
            <div className="mt-6 glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold mb-2">PSNR History</h3>
              <Line
                data={{
                  labels: selectedItem.metadata.psnr_history.map((h: any) => new Date(h.timestamp).toLocaleString()),
                  datasets: [
                    {
                      label: 'PSNR Before (dB)',
                      data: selectedItem.metadata.psnr_history.map((h: any) => h.psnr_before ?? null),
                      borderColor: 'rgba(249,115,22,0.95)',
                      backgroundColor: 'rgba(249,115,22,0.12)',
                      tension: 0.25,
                      fill: true,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                    {
                      label: 'PSNR After (dB)',
                      data: selectedItem.metadata.psnr_history.map((h: any) => h.psnr_after ?? null),
                      borderColor: 'rgba(14,165,233,0.95)',
                      backgroundColor: 'rgba(14,165,233,0.14)',
                      tension: 0.25,
                      fill: true,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: { enabled: true, mode: 'index' }
                  },
                  scales: {
                    y: { beginAtZero: true, suggestedMax: 60 },
                    x: { ticks: { maxRotation: 45, minRotation: 0 } }
                  }
                }}
              />
              {/* Latest stats */}
              <div className="mt-4 text-sm text-muted-foreground">
                {(() => {
                  const last = selectedItem.metadata.psnr_history[selectedItem.metadata.psnr_history.length - 1];
                  const prev = selectedItem.metadata.psnr_history[selectedItem.metadata.psnr_history.length - 2];
                  const improvement = last && prev && last.psnr_after != null && prev.psnr_after != null
                    ? (last.psnr_after - prev.psnr_after)
                    : null;

                  return (
                    <div>
                      <div>Model used: <strong>{last.model ?? selectedItem.metadata.model_used ?? 'unknown'}</strong></div>
                      <div className="mt-1">Last After: <strong>{last.psnr_after != null ? `${last.psnr_after} dB` : 'N/A'}</strong></div>
                      {improvement != null ? (
                        <div className="mt-1">Change vs previous: <strong className={improvement >= 0 ? 'text-green-600' : 'text-rose-600'}>{improvement >= 0 ? '+' : ''}{improvement.toFixed(2)} dB</strong></div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>

              {/* Frequency Histograms */}
              {(() => {
                const last = selectedItem.metadata.psnr_history[selectedItem.metadata.psnr_history.length - 1];
                const hists = last?.histograms;
                return hists && (hists.degraded?.length || 0) > 0 && (hists.enhanced?.length || 0) > 0 ? (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-semibold mb-4">Frequency Distribution (Grayscale)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Before (Degraded)</p>
                        <Bar
                          data={{
                            labels: Array.from({length: 256}, (_, i) => i),
                            datasets: [
                              {
                                label: 'Frequency',
                                data: hists.degraded || [],
                                backgroundColor: 'rgba(234,88,12,0.6)',
                                borderColor: 'rgba(234,88,12,0.8)',
                                borderWidth: 0,
                                borderRadius: 0
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            scales: {
                              x: { display: false },
                              y: { beginAtZero: true, ticks: { display: false } }
                            },
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                        />
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">After (Enhanced)</p>
                        <Bar
                          data={{
                            labels: Array.from({length: 256}, (_, i) => i),
                            datasets: [
                              {
                                label: 'Frequency',
                                data: hists.enhanced || [],
                                backgroundColor: 'rgba(14,165,233,0.6)',
                                borderColor: 'rgba(14,165,233,0.8)',
                                borderWidth: 0,
                                borderRadius: 0
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            scales: {
                              x: { display: false },
                              y: { beginAtZero: true, ticks: { display: false } }
                            },
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          ) : null}

          <div className="mt-6 glass rounded-2xl p-4">
            <p className="text-sm text-muted-foreground">
              Source: {selectedItem.metadata?.source === "camera_capture" ? "Camera Capture" : "Manual Upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(selectedItem.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <div className="w-10" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-muted-foreground text-lg">
              No images in gallery yet. Capture or upload an image to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-square relative">
                  <img
                    src={item.enhanced_image_url}
                    alt="Enhanced"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="bg-background/80 backdrop-blur-sm rounded-full"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
