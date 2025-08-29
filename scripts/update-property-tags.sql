-- Update property tags to include Families-only and Females-only
-- This script will randomly select 6 properties and update their tags

-- First, let's see the current tags distribution
SELECT 
  id,
  title,
  tags,
  array_length(tags, 1) as tag_count
FROM properties 
WHERE tags IS NOT NULL
ORDER BY RANDOM()
LIMIT 10;

-- Update 3 random properties to include "Families-only"
UPDATE properties 
SET tags = array_append(tags, 'Families-only')
WHERE id IN (
  SELECT id 
  FROM properties 
  WHERE tags IS NOT NULL 
    AND NOT ('Families-only' = ANY(tags))  -- Don't add if already exists
  ORDER BY RANDOM() 
  LIMIT 3
);

-- Update 3 different random properties to include "Females-only"
UPDATE properties 
SET tags = array_append(tags, 'Females-only')
WHERE id IN (
  SELECT id 
  FROM properties 
  WHERE tags IS NOT NULL 
    AND NOT ('Females-only' = ANY(tags))  -- Don't add if already exists
    AND NOT ('Families-only' = ANY(tags))  -- Avoid properties that already have Families-only
  ORDER BY RANDOM() 
  LIMIT 3
);

-- Verify the changes
SELECT 
  id,
  title,
  tags,
  array_length(tags, 1) as tag_count
FROM properties 
WHERE tags IS NOT NULL 
  AND ('Families-only' = ANY(tags) OR 'Females-only' = ANY(tags))
ORDER BY title;

-- Show summary of updated properties
SELECT 
  'Families-only' as tag_type,
  COUNT(*) as property_count
FROM properties 
WHERE 'Families-only' = ANY(tags)
UNION ALL
SELECT 
  'Females-only' as tag_type,
  COUNT(*) as property_count
FROM properties 
WHERE 'Females-only' = ANY(tags);
