-- Fix google_reviews_count data that wasn't transferred properly
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT 
  title,
  average_rating as old_rating,
  review_count as old_review_count,
  google_rating,
  google_reviews_count
FROM properties 
WHERE google_rating IS NOT NULL
LIMIT 5;

-- Update google_reviews_count with the old review_count data
UPDATE properties 
SET 
  google_reviews_count = review_count,
  google_last_updated = NOW()
WHERE google_rating IS NOT NULL 
  AND google_reviews_count IS NULL 
  AND review_count IS NOT NULL;

-- Verify the fix
SELECT 
  title,
  average_rating as old_rating,
  review_count as old_review_count,
  google_rating,
  google_reviews_count,
  google_last_updated
FROM properties 
WHERE google_rating IS NOT NULL
ORDER BY google_rating DESC
LIMIT 10;

-- Show final summary
SELECT 
  'Final Summary' as info,
  COUNT(*) as total_properties,
  COUNT(google_rating) as with_google_ratings,
  COUNT(google_reviews_count) as with_google_review_counts,
  AVG(google_rating) as avg_google_rating,
  SUM(google_reviews_count) as total_google_reviews
FROM properties; 