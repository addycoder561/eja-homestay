-- Check trips table structure
-- This will help us understand if the table has all required columns

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'trips'
ORDER BY ordinal_position;

-- Check if there are any trips in the table
SELECT COUNT(*) as total_trips FROM trips;

-- Show sample trip data
SELECT 
    id,
    title,
    description,
    location,
    price,
    image,
    rating,
    review_count,
    created_at
FROM trips 
LIMIT 5;
