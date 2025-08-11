-- Check what tables exist in the database
-- This will help us understand the correct table structure

-- List all tables
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if retreats table exists and has data
SELECT 
    'retreats' as table_name,
    COUNT(*) as record_count
FROM information_schema.tables 
WHERE table_name = 'retreats';

-- If retreats table exists, show its structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'retreats'
ORDER BY ordinal_position;

-- Show sample data from retreats table (if it exists)
SELECT 
    id,
    title,
    description,
    location,
    price,
    created_at
FROM retreats 
LIMIT 5;

-- Check which table the wishlist trip IDs point to
SELECT 
    w.item_id,
    w.item_type,
    CASE 
        WHEN r.id IS NOT NULL THEN 'EXISTS_IN_RETREATS'
        ELSE 'NOT_FOUND'
    END as found_in_table,
    r.title as title
FROM wishlist w
LEFT JOIN retreats r ON w.item_id = r.id
WHERE w.user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
  AND w.item_type = 'trip';
