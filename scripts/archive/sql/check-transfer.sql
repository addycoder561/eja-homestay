-- Check the current state of rating data transfer
-- Run this in your Supabase SQL Editor

-- Check what columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name LIKE '%rating%' OR column_name LIKE '%review%'
ORDER BY column_name;

-- Check sample data
SELECT 
  title,
  average_rating,
  review_count,
  google_rating,
  google_reviews_count,
  google_last_updated
FROM properties 
LIMIT 5;

-- Count properties with different rating types
SELECT 
  'Summary' as info,
  COUNT(*) as total_properties,
  COUNT(average_rating) as with_old_ratings,
  COUNT(google_rating) as with_google_ratings,
  COUNT(google_reviews_count) as with_google_review_counts
FROM properties; 