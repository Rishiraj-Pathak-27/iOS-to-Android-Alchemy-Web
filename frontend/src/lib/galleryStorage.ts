// LocalStorage-based gallery management as fallback
interface GalleryItem {
  id: string;
  original_image_url: string;
  enhanced_image_url: string;
  created_at: string;
  metadata: {
    source: string;
    enhancement?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    timestamp?: string;
  };
}

const GALLERY_KEY = 'ios-alchemy-gallery';

export const galleryStorage = {
  // Get all gallery items
  getAll(): GalleryItem[] {
    try {
      const stored = localStorage.getItem(GALLERY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from gallery storage:', error);
      return [];
    }
  },

  // Add a new item to gallery
  add(item: Omit<GalleryItem, 'id' | 'created_at'>): GalleryItem {
    try {
      const items = this.getAll();
      const newItem: GalleryItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      items.unshift(newItem); // Add to beginning
      localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error('Error adding to gallery storage:', error);
      throw error;
    }
  },

  // Delete an item from gallery
  delete(id: string): boolean {
    try {
      const items = this.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(GALLERY_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting from gallery storage:', error);
      return false;
    }
  },

  // Clear all gallery items
  clear(): void {
    try {
      localStorage.removeItem(GALLERY_KEY);
    } catch (error) {
      console.error('Error clearing gallery storage:', error);
    }
  },

  // Get storage usage info
  getStorageInfo(): { count: number; estimatedSize: string } {
    const items = this.getAll();
    const data = localStorage.getItem(GALLERY_KEY) || '';
    const sizeInBytes = new Blob([data]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    return {
      count: items.length,
      estimatedSize: `${sizeInMB} MB`
    };
  }
};

