-- Add sample review counts to google_reviews_count column
-- Run this in your Supabase SQL Editor

-- Update google_reviews_count with sample data
UPDATE properties 
SET 
  google_reviews_count = CASE 
    WHEN google_rating >= 4.8 THEN 150 + (RANDOM() * 100)::INTEGER
    WHEN google_rating >= 4.5 THEN 100 + (RANDOM() * 80)::INTEGER
    WHEN google_rating >= 4.0 THEN 50 + (RANDOM() * 60)::INTEGER
    ELSE 20 + (RANDOM() * 40)::INTEGER
  END,
  google_last_updated = NOW()
WHERE google_rating IS NOT NULL 
  AND google_reviews_count IS NULL;

-- Verify the update
SELECT 
  title,
  google_rating,
  google_reviews_count,
  google_last_updated
FROM properties 
WHERE google_rating IS NOT NULL
ORDER BY google_rating DESC
LIMIT 10;

-- Show summary
SELECT 
  'Summary' as info,
  COUNT(*) as total_properties,
  COUNT(google_rating) as with_google_ratings,
  COUNT(google_reviews_count) as with_google_review_counts,
  AVG(google_rating) as avg_google_rating,
  SUM(google_reviews_count) as total_google_reviews
FROM properties; 