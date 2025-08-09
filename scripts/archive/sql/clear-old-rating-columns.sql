-- Clear old rating columns after successful transfer to Google rating columns
-- Run this in your Supabase SQL Editor

-- Step 1: Verify data transfer was successful
SELECT 
  'Verification' as step,
  COUNT(*) as total_properties,
  COUNT(google_rating) as with_google_ratings,
  COUNT(average_rating) as with_old_ratings
FROM properties;

-- Step 2: Show sample data to confirm transfer
SELECT 
  title,
  average_rating as old_rating,
  review_count as old_review_count,
  google_rating as new_google_rating,
  google_review_count as new_google_review_count
FROM properties 
WHERE google_rating IS NOT NULL
ORDER BY google_rating DESC
LIMIT 5;

-- Step 3: Clear the old rating columns
UPDATE properties 
SET 
  average_rating = NULL,
  review_count = NULL
WHERE google_rating IS NOT NULL 
  AND google_rating > 0;

-- Step 4: Verify the clearing was successful
SELECT 
  'After Clearing' as step,
  COUNT(*) as total_properties,
  COUNT(google_rating) as with_google_ratings,
  COUNT(average_rating) as with_old_ratings
FROM properties;

-- Step 5: Show final state
SELECT 
  title,
  average_rating as old_rating,
  review_count as old_review_count,
  google_rating as google_rating,
  google_review_count as google_review_count
FROM properties 
ORDER BY google_rating DESC NULLS LAST
LIMIT 10; 