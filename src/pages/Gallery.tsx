import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ComparisonSlider from "@/components/ComparisonSlider";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading gallery:", error);
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      
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
