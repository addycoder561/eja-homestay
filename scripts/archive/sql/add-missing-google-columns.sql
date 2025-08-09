-- Add missing Google rating columns to properties table
-- Run this in your Supabase SQL Editor

-- Add the missing google_last_updated column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS google_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment to explain the column
COMMENT ON COLUMN properties.google_last_updated IS 'When the Google rating was last updated';

-- Verify the columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name LIKE 'google%'
ORDER BY column_name; 