-- Check trips table and wishlist entries
-- This will help us understand why retreats aren't showing in the wishlist

-- First, let's see what's in the trips table
SELECT 
    id,
    title,
    description,
    location,
    price,
    created_at
FROM trips 
ORDER BY created_at DESC;

-- Now let's see the wishlist entries for your user
SELECT 
    w.id,
    w.user_id,
    w.item_id,
    w.item_type,
    w.created_at,
    CASE 
        WHEN w.item_type = 'trip' THEN t.title
        WHEN w.item_type = 'property' THEN p.title
        WHEN w.item_type = 'experience' THEN e.title
        ELSE 'Unknown'
    END as item_title
FROM wishlist w
LEFT JOIN trips t ON w.item_id = t.id AND w.item_type = 'trip'
LEFT JOIN properties p ON w.item_id = p.id AND w.item_type = 'property'
LEFT JOIN experiences e ON w.item_id = e.id AND w.item_type = 'experience'
WHERE w.user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
ORDER BY w.created_at DESC;

-- Check if the trip IDs in wishlist actually exist in trips table
SELECT 
    w.item_id as wishlist_trip_id,
    CASE 
        WHEN t.id IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as trip_exists,
    t.title as trip_title
FROM wishlist w
LEFT JOIN trips t ON w.item_id = t.id
WHERE w.user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
  AND w.item_type = 'trip';
