-- Update usps column spacing in properties table
-- This script replaces the specific text pattern with proper spacing

-- First, let's see what we're working with
SELECT id, usps FROM properties WHERE usps IS NOT NULL;

-- Update the specific text pattern in the usps array
UPDATE properties 
SET usps = array_replace(usps, 'Mountain View,Pet Friendly,Family Friendly', 'Mountain View, Pet Friendly, Family Friendly')
WHERE usps IS NOT NULL 
AND 'Mountain View,Pet Friendly,Family Friendly' = ANY(usps);

-- If the above doesn't work, try this approach that handles each element individually:
UPDATE properties 
SET usps = array(
  SELECT 
    CASE 
      WHEN element = 'Mountain View,Pet Friendly,Family Friendly' THEN 'Mountain View, Pet Friendly, Family Friendly'
      ELSE element
    END
  FROM unnest(usps) AS element
)
WHERE usps IS NOT NULL 
AND 'Mountain View,Pet Friendly,Family Friendly' = ANY(usps);

-- Alternative approach using string functions if the above doesn't work:
UPDATE properties 
SET usps = string_to_array(
  replace(
    array_to_string(usps, ','), 
    'Mountain View,Pet Friendly,Family Friendly', 
    'Mountain View, Pet Friendly, Family Friendly'
  ), 
  ','
)::text[]
WHERE usps IS NOT NULL 
AND 'Mountain View,Pet Friendly,Family Friendly' = ANY(usps);

-- Verify the changes
SELECT id, usps FROM properties WHERE usps IS NOT NULL; 