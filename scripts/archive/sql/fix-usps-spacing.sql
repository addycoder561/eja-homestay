-- Fix usps column spacing in properties table
-- Replace "Mountain View,Pet Friendly,Family Friendly" with "Mountain View, Pet Friendly, Family Friendly"

-- First, let's see the current data
SELECT id, usps FROM properties WHERE usps IS NOT NULL;

-- Method 1: Using array_replace (most direct approach)
UPDATE properties 
SET usps = array_replace(usps, 'Mountain View,Pet Friendly,Family Friendly', 'Mountain View, Pet Friendly, Family Friendly')
WHERE usps IS NOT NULL 
AND 'Mountain View,Pet Friendly,Family Friendly' = ANY(usps);

-- Method 2: If Method 1 doesn't work, use string manipulation
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

-- Method 3: Most comprehensive approach - handles each element individually
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

-- Verify the changes
SELECT id, usps FROM properties WHERE usps IS NOT NULL;

-- Count how many rows were affected
SELECT COUNT(*) as affected_rows 
FROM properties 
WHERE usps IS NOT NULL 
AND 'Mountain View, Pet Friendly, Family Friendly' = ANY(usps); 