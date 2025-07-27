-- Add Google rating fields to properties table
-- This allows hosts to manually enter their Google ratings

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1) CHECK (google_rating >= 0 AND google_rating <= 5),
ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comment to explain the columns
COMMENT ON COLUMN properties.google_rating IS 'Google rating (0.0 to 5.0) manually entered by host';
COMMENT ON COLUMN properties.google_reviews_count IS 'Number of Google reviews manually entered by host';
COMMENT ON COLUMN properties.google_place_id IS 'Google Place ID for future API integration';
COMMENT ON COLUMN properties.google_last_updated IS 'When the Google rating was last updated';

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_properties_google_rating ON properties(google_rating) WHERE google_rating IS NOT NULL; 