-- Cleanup script for deleted property: 02b77cb1-ff10-4f81-b0b5-9959b6e06628
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for cleanup operations
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- 1. Delete room inventory records for all rooms of this property
DELETE FROM room_inventory 
WHERE room_id IN (
    SELECT id FROM rooms WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
);

-- 2. Delete booking_rooms records for bookings of this property
DELETE FROM booking_rooms 
WHERE booking_id IN (
    SELECT id FROM bookings WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
);

-- 3. Delete bookings for this property
DELETE FROM bookings 
WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628';

-- 4. Delete reviews for this property
DELETE FROM reviews 
WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628';

-- 5. Delete bookmarks for this property
DELETE FROM bookmarks 
WHERE item_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628' 
AND item_type = 'property';

-- 6. Delete rooms for this property
DELETE FROM rooms 
WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628';

-- Re-enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Verify cleanup
SELECT 
    'Properties' as table_name,
    COUNT(*) as remaining_records
FROM properties 
WHERE id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'

UNION ALL

SELECT 
    'Rooms' as table_name,
    COUNT(*) as remaining_records
FROM rooms 
WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'

UNION ALL

SELECT 
    'Room Inventory' as table_name,
    COUNT(*) as remaining_records
FROM room_inventory ri
JOIN rooms r ON ri.room_id = r.id
WHERE r.property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'

UNION ALL

SELECT 
    'Bookings' as table_name,
    COUNT(*) as remaining_records
FROM bookings 
WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'

UNION ALL

SELECT 
    'Booking Rooms' as table_name,
    COUNT(*) as remaining_records
FROM booking_rooms br
JOIN bookings b ON br.booking_id = b.id
WHERE b.property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'

UNION ALL

SELECT 
    'Reviews' as table_name,
    COUNT(*) as remaining_records
FROM reviews 
WHERE property_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628'

UNION ALL

SELECT 
    'Bookmarks' as table_name,
    COUNT(*) as remaining_records
FROM bookmarks 
WHERE item_id = '02b77cb1-ff10-4f81-b0b5-9959b6e06628' 
AND item_type = 'property';

-- Show final property count
SELECT 
    COUNT(*) as total_properties_remaining,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_properties
FROM properties; 