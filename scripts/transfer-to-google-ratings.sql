-- Transfer existing rating data to Google rating columns
-- Run this in your Supabase SQL Editor

-- Step 1: Transfer data from average_rating to google_rating
UPDATE properties 
SET 
  google_rating = average_rating,
  google_review_count = review_count,
  google_last_updated = NOW()
WHERE average_rating IS NOT NULL 
  AND average_rating > 0;

-- Step 2: Clear the old columns (optional - uncomment if you want to clear them)
-- UPDATE properties 
-- SET 
--   average_rating = NULL,
--   review_count = NULL
-- WHERE google_rating IS NOT NULL;

-- Step 3: Verify the transfer
SELECT 
  title,
  average_rating as old_rating,
  review_count as old_review_count,
  google_rating as new_google_rating,
  google_review_count as new_google_review_count,
  google_last_updated
FROM properties 
WHERE google_rating IS NOT NULL
ORDER BY google_rating DESC;

-- Step 4: Show summary
SELECT 
  'Transfer Summary' as info,
  COUNT(*) as total_properties,
  COUNT(google_rating) as properties_with_google_ratings,
  AVG(google_rating) as average_google_rating,
  SUM(google_review_count) as total_google_reviews
FROM properties;

-- Step 5: Show properties that still need ratings
SELECT 
  title,
  'No Google rating yet' as status
FROM properties 
WHERE google_rating IS NULL OR google_rating = 0
ORDER BY title; 