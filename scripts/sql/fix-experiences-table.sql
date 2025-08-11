-- Fix experiences table - ensure all required columns exist
-- This script adds any missing columns and updates existing ones

-- Add max_guests column if it doesn't exist (it should exist, but let's be safe)
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 10;

-- Add duration column if it doesn't exist
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '2-3 hrs';

-- Add categories column if it doesn't exist
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY['General'];

-- Add cover_image column if it doesn't exist
ALTER TABLE experiences 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Update existing experiences to have proper values
UPDATE experiences 
SET 
  max_guests = COALESCE(max_guests, 10),
  duration = COALESCE(duration, '2-3 hrs'),
  categories = COALESCE(categories, ARRAY['General'])
WHERE 
  max_guests IS NULL 
  OR duration IS NULL 
  OR categories IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_categories ON experiences USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences(location);
CREATE INDEX IF NOT EXISTS idx_experiences_price ON experiences(price);

-- Add comments for documentation
COMMENT ON COLUMN experiences.max_guests IS 'Maximum number of guests allowed for this experience';
COMMENT ON COLUMN experiences.duration IS 'Duration of the experience (e.g., "2-3 hrs", "Full day")';
COMMENT ON COLUMN experiences.categories IS 'Array of categories for filtering (e.g., ["Mountain", "Immersive"])';
COMMENT ON COLUMN experiences.cover_image IS 'Primary cover image URL for the experience';

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'experiences' 
ORDER BY ordinal_position;
