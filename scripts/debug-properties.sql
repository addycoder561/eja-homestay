-- Debug script to check properties table structure and data
-- Run this in Supabase SQL Editor to see what's actually in the database

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Check sample data
SELECT 
  id,
  title,
  property_type,
  amenities,
  tags,
  price_per_night,
  city,
  is_available
FROM properties 
LIMIT 10;

-- Check property types
SELECT 
  property_type,
  COUNT(*) as count
FROM properties 
WHERE is_available = true
GROUP BY property_type
ORDER BY count DESC;

-- Check amenities
SELECT 
  unnest(amenities) as amenity,
  COUNT(*) as count
FROM properties 
WHERE is_available = true AND amenities IS NOT NULL
GROUP BY amenity
ORDER BY count DESC;

-- Check tags
SELECT 
  unnest(tags) as tag,
  COUNT(*) as count
FROM properties 
WHERE is_available = true AND tags IS NOT NULL
GROUP BY tag
ORDER BY count DESC;

-- Test specific filters
-- Property type filter
SELECT COUNT(*) as boutique_count
FROM properties 
WHERE is_available = true AND property_type = 'Boutique';

SELECT COUNT(*) as homely_count
FROM properties 
WHERE is_available = true AND property_type = 'Homely';

SELECT COUNT(*) as offbeat_count
FROM properties 
WHERE is_available = true AND property_type = 'Off-Beat';

-- Amenities filter
SELECT COUNT(*) as pet_friendly_count
FROM properties 
WHERE is_available = true AND 'Pet Friendly' = ANY(amenities);

SELECT COUNT(*) as pure_veg_count
FROM properties 
WHERE is_available = true AND 'Pure-Veg' = ANY(amenities);

-- Tags filter
SELECT COUNT(*) as families_only_count
FROM properties 
WHERE is_available = true AND 'Families only' = ANY(tags);

SELECT COUNT(*) as females_only_count
FROM properties 
WHERE is_available = true AND 'Females only' = ANY(tags);
