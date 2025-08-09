-- Add Google ratings to properties
-- Run this in your Supabase SQL Editor after running the migration

-- First, run the migration to add Google rating columns
-- (This should already be done if you ran the migration)

-- Add sample Google ratings to some properties
-- You can replace these with actual Google ratings from your properties

UPDATE properties 
SET 
  google_rating = 4.7,
  google_reviews_count = 156,
  google_last_updated = NOW()
WHERE title = 'The Turtle Huts';

UPDATE properties 
SET 
  google_rating = 4.5,
  google_reviews_count = 89,
  google_last_updated = NOW()
WHERE title = 'Keekoo Stays';

UPDATE properties 
SET 
  google_rating = 4.8,
  google_reviews_count = 234,
  google_last_updated = NOW()
WHERE title = 'Sundays Forever Kings Cottage';

UPDATE properties 
SET 
  google_rating = 4.6,
  google_reviews_count = 67,
  google_last_updated = NOW()
WHERE title = 'Annfield Cottage';

UPDATE properties 
SET 
  google_rating = 4.4,
  google_reviews_count = 123,
  google_last_updated = NOW()
WHERE title = 'Jharipani Castle';

UPDATE properties 
SET 
  google_rating = 4.9,
  google_reviews_count = 45,
  google_last_updated = NOW()
WHERE title = 'The Lanswood Estate';

UPDATE properties 
SET 
  google_rating = 4.3,
  google_reviews_count = 78,
  google_last_updated = NOW()
WHERE title = 'Karinya Villas';

UPDATE properties 
SET 
  google_rating = 4.7,
  google_reviews_count = 112,
  google_last_updated = NOW()
WHERE title = 'Castle Glamp';

UPDATE properties 
SET 
  google_rating = 4.6,
  google_reviews_count = 95,
  google_last_updated = NOW()
WHERE title = 'Moustache Select Mukteshwar';

UPDATE properties 
SET 
  google_rating = 4.5,
  google_reviews_count = 134,
  google_last_updated = NOW()
WHERE title = 'Kasauli Pebbles';

-- Verify the updates
SELECT 
  title,
  google_rating,
  google_reviews_count,
  google_last_updated
FROM properties 
WHERE google_rating IS NOT NULL
ORDER BY google_rating DESC;

-- Show properties without Google ratings
SELECT 
  title,
  'No Google rating' as status
FROM properties 
WHERE google_rating IS NULL
ORDER BY title; 