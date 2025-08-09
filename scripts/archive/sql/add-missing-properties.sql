-- Add missing properties room data
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for bulk operations
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory DISABLE ROW LEVEL SECURITY;

-- Moustache Select Mukteshwar (Base: ₹9000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('ea43a73c-4985-40c9-a5aa-aa8d8731e3e6', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 9000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('ea43a73c-4985-40c9-a5aa-aa8d8731e3e6', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 13500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('ea43a73c-4985-40c9-a5aa-aa8d8731e3e6', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 16200, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Kasauli Pebbles (Base: ₹6000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('f2ba9ee3-d789-4af3-8727-4e7227a19559', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 6000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('f2ba9ee3-d789-4af3-8727-4e7227a19559', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 9000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('f2ba9ee3-d789-4af3-8727-4e7227a19559', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 10800, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- LivingStone Ojuven Resort (Base: ₹8000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('caf51be6-1b5c-4572-ac6e-443e9c9c53af', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 8000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('caf51be6-1b5c-4572-ac6e-443e9c9c53af', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 12000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('caf51be6-1b5c-4572-ac6e-443e9c9c53af', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 14400, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Monkey Mud House and Glamps (Base: ₹5000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('40ada796-806a-4a0d-bcef-57f561fe104c', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 5000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('40ada796-806a-4a0d-bcef-57f561fe104c', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 7500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('40ada796-806a-4a0d-bcef-57f561fe104c', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 9000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Generate 180 days of inventory data for the new rooms
DO $$
DECLARE
    room_record RECORD;
    current_date DATE := CURRENT_DATE;
    i INTEGER;
BEGIN
    FOR room_record IN SELECT id, total_inventory FROM rooms WHERE property_id IN (
        'ea43a73c-4985-40c9-a5aa-aa8d8731e3e6',
        'f2ba9ee3-d789-4af3-8727-4e7227a19559',
        'caf51be6-1b5c-4572-ac6e-443e9c9c53af',
        '40ada796-806a-4a0d-bcef-57f561fe104c'
    )
    LOOP
        FOR i IN 0..179 LOOP
            INSERT INTO room_inventory (room_id, date, available)
            VALUES (room_record.id, current_date + i, room_record.total_inventory);
        END LOOP;
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory ENABLE ROW LEVEL SECURITY;

-- Verify all 23 properties now have rooms
SELECT 
    p.title,
    COUNT(r.id) as room_count,
    SUM(r.total_inventory) as total_units
FROM properties p
LEFT JOIN rooms r ON p.id = r.property_id
WHERE p.id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
GROUP BY p.id, p.title
ORDER BY p.title;

-- Show final count
SELECT 
    COUNT(DISTINCT p.id) as total_properties,
    COUNT(r.id) as total_rooms,
    COUNT(ri.id) as total_inventory_records
FROM properties p
LEFT JOIN rooms r ON p.id = r.property_id
LEFT JOIN room_inventory ri ON r.id = ri.room_id
WHERE p.id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628'; 