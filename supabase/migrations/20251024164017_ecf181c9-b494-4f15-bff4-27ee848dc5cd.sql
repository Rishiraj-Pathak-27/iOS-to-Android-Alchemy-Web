-- Create gallery table to store enhanced images
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_image_url TEXT NOT NULL,
  enhanced_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read gallery images (public gallery)
CREATE POLICY "Anyone can view gallery"
  ON public.gallery
  FOR SELECT
  USING (true);

-- Allow anyone to insert images (no auth required for demo)
CREATE POLICY "Anyone can insert images"
  ON public.gallery
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_gallery_created_at ON public.gallery(created_at DESC);