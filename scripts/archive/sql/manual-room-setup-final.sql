-- Manual Room Setup Script for EJA Homestay (FINAL VERSION)
-- Run this in your Supabase SQL Editor

-- Step 1: Add room_config column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS room_config JSONB;

-- Step 2: Temporarily disable RLS for bulk operations
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory DISABLE ROW LEVEL SECURITY;

-- Step 3: Clear existing room data (except target property)
DELETE FROM room_inventory WHERE room_id IN (
  SELECT id FROM rooms WHERE property_id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
);
DELETE FROM rooms WHERE property_id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628';

-- Step 4: Create room configurations for all properties
-- The Turtle Huts (Base: ₹4500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('69d69258-895f-49b4-a463-c4a50b776bf4', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 4500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('69d69258-895f-49b4-a463-c4a50b776bf4', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 6750, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('69d69258-895f-49b4-a463-c4a50b776bf4', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 8100, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Keekoo Stays (Base: ₹9000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('066538bd-9a33-4cc5-9363-48cafa8cf5b9', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 9000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('066538bd-9a33-4cc5-9363-48cafa8cf5b9', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 13500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('066538bd-9a33-4cc5-9363-48cafa8cf5b9', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 16200, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Sundays Forever Kings Cottage (Base: ₹15000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('4ded59ec-c920-47cd-97c6-e245424cc06d', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 15000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('4ded59ec-c920-47cd-97c6-e245424cc06d', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 22500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('4ded59ec-c920-47cd-97c6-e245424cc06d', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 27000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Annfield Cottage (Base: ₹6000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('b4d91704-2e73-4191-8ba8-e9665bcb500e', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 6000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('b4d91704-2e73-4191-8ba8-e9665bcb500e', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 9000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('b4d91704-2e73-4191-8ba8-e9665bcb500e', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 10800, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Jharipani Castle (Base: ₹4000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('9f1b5a4f-a04e-48eb-bdaf-b31c3ca12115', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 4000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('9f1b5a4f-a04e-48eb-bdaf-b31c3ca12115', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 6000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('9f1b5a4f-a04e-48eb-bdaf-b31c3ca12115', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 7200, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- The Lanswood Estate (Base: ₹3000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('e885558d-4b70-430d-bbd8-3deb104413e4', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 3000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('e885558d-4b70-430d-bbd8-3deb104413e4', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 4500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('e885558d-4b70-430d-bbd8-3deb104413e4', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 5400, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Karinya Villas (Base: ₹7500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('540b0e03-a518-4252-a822-f131ffd63385', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 7500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('540b0e03-a518-4252-a822-f131ffd63385', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 11250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('540b0e03-a518-4252-a822-f131ffd63385', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 13500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Castle Glamp (Base: ₹9000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('4094c850-2cbc-455d-ac68-cb6f9ff95cbf', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 9000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('4094c850-2cbc-455d-ac68-cb6f9ff95cbf', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 13500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('4094c850-2cbc-455d-ac68-cb6f9ff95cbf', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 16200, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Mountain Bliss Homestay (Base: ₹2000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('30382de1-6fac-402b-b23f-b69c3743124f', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 2000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('30382de1-6fac-402b-b23f-b69c3743124f', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 3000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('30382de1-6fac-402b-b23f-b69c3743124f', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 3600, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Iris Cottage Dalhousie (Base: ₹7500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('7d4616a4-2385-417c-a13d-6c6d833f6e16', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 7500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('7d4616a4-2385-417c-a13d-6c6d833f6e16', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 11250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('7d4616a4-2385-417c-a13d-6c6d833f6e16', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 13500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Naddi Castle Homestay (Base: ₹7000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('a5173703-8cfd-45c3-bf37-80ebbe69590c', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 7000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('a5173703-8cfd-45c3-bf37-80ebbe69590c', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 10500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('a5173703-8cfd-45c3-bf37-80ebbe69590c', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 12600, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Winterfell The Stay (Base: ₹2000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('3c2a041c-8b25-4223-b8c6-a9a61e8382e2', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 2000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('3c2a041c-8b25-4223-b8c6-a9a61e8382e2', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 3000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('3c2a041c-8b25-4223-b8c6-a9a61e8382e2', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 3600, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Zabarwan Peaks Villa (Base: ₹3500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('092ba70b-d7b8-44fc-9143-1c0837b8491f', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 3500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('092ba70b-d7b8-44fc-9143-1c0837b8491f', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 5250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('092ba70b-d7b8-44fc-9143-1c0837b8491f', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 6300, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Desert Blue Pangong (Base: ₹12000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('15dd2349-7d30-47dc-a3da-23a33aa63db3', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 12000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('15dd2349-7d30-47dc-a3da-23a33aa63db3', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 18000, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('15dd2349-7d30-47dc-a3da-23a33aa63db3', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 21600, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- The Alpine Jungle Stay (Base: ₹3500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('9bdabede-a7a6-4c15-a619-6431e05eff8e', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 3500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('9bdabede-a7a6-4c15-a619-6431e05eff8e', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 5250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('9bdabede-a7a6-4c15-a619-6431e05eff8e', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 6300, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- The Firefly Eco Luxury Retreat (Base: ₹23000)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('e8f3f5a3-8188-4792-becb-fe13ecd381ec', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 23000, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('e8f3f5a3-8188-4792-becb-fe13ecd381ec', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 34500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('e8f3f5a3-8188-4792-becb-fe13ecd381ec', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 41400, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Bellevue Homestay Shillong (Base: ₹1500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('32db2712-ecae-4bdf-ac9c-8d71c9b6dfbf', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 1500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('32db2712-ecae-4bdf-ac9c-8d71c9b6dfbf', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 2250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('32db2712-ecae-4bdf-ac9c-8d71c9b6dfbf', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 2700, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Adlai Homestay (Base: ₹7500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('5434c393-3fca-43dc-9f28-9f96e05aa565', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 7500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('5434c393-3fca-43dc-9f28-9f96e05aa565', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 11250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('5434c393-3fca-43dc-9f28-9f96e05aa565', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 13500, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Mishmi Takin Homestay (Base: ₹1500)
INSERT INTO rooms (property_id, name, description, room_type, price, total_inventory, amenities, images) VALUES
('4dd816fb-033e-441d-a2ec-1865beba7a3f', 'Standard Room', 'Comfortable room with essential amenities for a pleasant stay', 'standard', 1500, 2, '["WiFi", "Fan", "Geyser", "Attached Bathroom"]'::jsonb, ARRAY[]::text[]),
('4dd816fb-033e-441d-a2ec-1865beba7a3f', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 'deluxe', 2250, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View"]'::jsonb, ARRAY[]::text[]),
('4dd816fb-033e-441d-a2ec-1865beba7a3f', 'Premium Suite', 'Luxury suite with top-tier amenities and exclusive features', 'premium', 2700, 2, '["WiFi", "AC", "Geyser", "TV", "Attached Bathroom", "Mountain View", "Balcony", "Premium Bedding"]'::jsonb, ARRAY[]::text[]);

-- Step 5: Generate 180 days of inventory data for all rooms
-- This will create inventory records for the next 180 days starting from today
DO $$
DECLARE
    room_record RECORD;
    current_date DATE := CURRENT_DATE;
    i INTEGER;
BEGIN
    FOR room_record IN SELECT id, total_inventory FROM rooms WHERE property_id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
    LOOP
        FOR i IN 0..179 LOOP
            INSERT INTO room_inventory (room_id, date, available)
            VALUES (room_record.id, current_date + i, room_record.total_inventory);
        END LOOP;
    END LOOP;
END $$;

-- Step 6: Re-enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory ENABLE ROW LEVEL SECURITY;

-- Step 7: Verify the data
SELECT 
    p.title,
    COUNT(r.id) as room_count,
    SUM(r.total_inventory) as total_units
FROM properties p
LEFT JOIN rooms r ON p.id = r.property_id
WHERE p.id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
GROUP BY p.id, p.title
ORDER BY p.title;

-- Check inventory data
SELECT 
    COUNT(*) as total_inventory_records,
    COUNT(DISTINCT room_id) as unique_rooms,
    MIN(date) as start_date,
    MAX(date) as end_date
FROM room_inventory;

-- Show sample pricing for verification
SELECT 
    p.title,
    r.name as room_name,
    r.price,
    r.room_type
FROM properties p
JOIN rooms r ON p.id = r.property_id
WHERE p.id != '02b77cb1-ff10-4f81-b0b5-9959b6e06628'
ORDER BY p.title, r.room_type; 