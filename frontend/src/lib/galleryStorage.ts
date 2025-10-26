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
const MAX_STORAGE_MB = 3; // Limit gallery to 3MB to leave room for other data
const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;

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

  // Check if we have space for a new item (estimate based on size)
  hasSpace(estimatedBytes: number): boolean {
    try {
      const items = this.getAll();
      const currentData = localStorage.getItem(GALLERY_KEY) || '';
      const currentSize = new Blob([currentData]).size;
      return (currentSize + estimatedBytes) < MAX_STORAGE_BYTES;
    } catch (error) {
      console.error('Error checking storage space:', error);
      return false;
    }
  },

  // Add a new item to gallery
  add(item: Omit<GalleryItem, 'id' | 'created_at'>): GalleryItem {
    try {
      const items = this.getAll();
      
      // Estimate the size of the new item
      const itemJson = JSON.stringify(item);
      const estimatedSize = new Blob([itemJson]).size;
      
      // If we don't have space, remove oldest items to make room
      let currentData = localStorage.getItem(GALLERY_KEY) || '';
      let currentSize = new Blob([currentData]).size;
      
      while ((currentSize + estimatedSize) >= MAX_STORAGE_BYTES && items.length > 0) {
        items.pop(); // Remove oldest item
        currentData = JSON.stringify(items);
        currentSize = new Blob([currentData]).size;
        console.log(`Removed oldest gallery item to make space. Current size: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      const newItem: GalleryItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
      };
      items.unshift(newItem); // Add to beginning
      localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
      console.log(`Gallery item added. New size: ${((currentSize + estimatedSize) / 1024 / 1024).toFixed(2)}MB`);
      return newItem;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded - removing old items');
        this.clear();
        throw new Error('Gallery storage full - cleared old items. Please try again.');
      }
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
  getStorageInfo(): { count: number; estimatedSize: string; remaining: string; maxSize: string } {
    const items = this.getAll();
    const data = localStorage.getItem(GALLERY_KEY) || '';
    const sizeInBytes = new Blob([data]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - sizeInBytes);
    const remainingMB = (remainingBytes / (1024 * 1024)).toFixed(2);
    
    return {
      count: items.length,
      estimatedSize: `${sizeInMB} MB`,
      remaining: `${remainingMB} MB`,
      maxSize: `${MAX_STORAGE_MB} MB`
    };
  }
};

