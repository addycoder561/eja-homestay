-- Migration: Update experiences table with new columns
-- This migration adds cover_image, duration, and categories columns

-- Add new columns to experiences table
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Create index for categories for better query performance
CREATE INDEX IF NOT EXISTS idx_experiences_categories ON experiences USING GIN (categories);

-- Add comment to document the new structure
COMMENT ON COLUMN experiences.cover_image IS 'Primary cover image URL for the experience';
COMMENT ON COLUMN experiences.duration IS 'Duration of the experience (e.g., "2-3 hrs")';
COMMENT ON COLUMN experiences.categories IS 'Array of categories for filtering (e.g., ["Mountain", "Immersive"])';

-- Update existing experiences to have default values if needed
UPDATE experiences 
SET 
  cover_image = COALESCE(cover_image, images[1]),
  duration = COALESCE(duration, '2-3 hrs'),
  categories = COALESCE(categories, ARRAY['General'])
WHERE cover_image IS NULL OR duration IS NULL OR categories IS NULL;
