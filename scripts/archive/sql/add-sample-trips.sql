-- Add sample trips data
-- This script assumes the trips table exists with the correct structure
-- If you get errors, run the complete setup script first

-- First, let's check if the table exists and has the right structure
DO $$
BEGIN
  -- Check if trips table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'trips') THEN
    RAISE EXCEPTION 'Trips table does not exist. Please run the complete setup script first.';
  END IF;
  
  -- Check if required columns exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'start_date') THEN
    RAISE EXCEPTION 'start_date column does not exist in trips table. Please run the complete setup script first.';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'end_date') THEN
    RAISE EXCEPTION 'end_date column does not exist in trips table. Please run the complete setup script first.';
  END IF;
END $$;

-- Insert sample trips data
INSERT INTO trips (id, title, subtitle, description, location, start_date, end_date, price, max_guests, images, created_at, updated_at) VALUES
(
  'b3b1c2d4-1234-4a1b-9abc-aaaaaaaabbbb',
  'Golden Triangle Tour',
  'Classic North India Circuit',
  'Experience the best of North India with this classic circuit. Visit the iconic Taj Mahal, explore the Pink City, and discover the capital.',
  'Delhi, Agra, Jaipur',
  '2024-12-25',
  '2024-12-29',
  8500.00,
  12,
  ARRAY['https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-bbbbbbbbcccc',
  'Goa Beach Getaway',
  'Sun, Sand & Portuguese Heritage',
  'Relax on pristine beaches and enjoy vibrant nightlife. Experience the perfect blend of Portuguese heritage and Indian culture.',
  'Goa',
  '2024-12-26',
  '2024-12-29',
  6500.00,
  8,
  ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-ccccccccdddd',
  'Kerala Backwaters',
  'Serene Houseboat Experience',
  'Cruise through the tranquil backwaters on a traditional houseboat. Experience the serene beauty of God''s Own Country.',
  'Alleppey, Kerala',
  '2024-12-27',
  '2024-12-29',
  9000.00,
  6,
  ARRAY['https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-ddddddddaaaa',
  'Himalayan Adventure',
  'High-Altitude Thrill',
  'Thrilling road trip through the majestic Himalayas. Experience high-altitude adventure and Buddhist culture.',
  'Leh, Ladakh',
  '2024-12-28',
  '2025-01-03',
  12000.00,
  10,
  ARRAY['https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-eeeeeeeeffff',
  'Rajasthan Heritage Tour',
  'Royal Palaces & Forts',
  'Explore the royal heritage of Rajasthan. Visit magnificent palaces, forts, and experience the regal lifestyle.',
  'Jaipur, Jodhpur, Udaipur',
  '2024-12-29',
  '2025-01-03',
  11000.00,
  8,
  ARRAY['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-ffffffffgggg',
  'South India Temple Trail',
  'Spiritual Heritage Discovery',
  'Discover the spiritual heritage of South India. Visit ancient temples and experience traditional rituals.',
  'Chennai, Madurai, Rameshwaram',
  '2024-12-30',
  '2025-01-03',
  7500.00,
  10,
  ARRAY['https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-gggggggghhhh',
  'Northeast Discovery',
  'Unexplored Beauty',
  'Explore the unexplored beauty of Northeast India. Visit tea gardens, wildlife sanctuaries, and tribal villages.',
  'Guwahati, Shillong, Kaziranga',
  '2024-12-31',
  '2025-01-05',
  9500.00,
  6,
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-hhhhhhhhiiii',
  'Mumbai to Goa Coastal Drive',
  'Scenic Konkan Coast',
  'Drive along the scenic Konkan coast. Experience the beauty of the Western Ghats and pristine beaches.',
  'Mumbai, Ratnagiri, Goa',
  '2025-01-01',
  '2025-01-04',
  8000.00,
  8,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Trips inserted successfully!' as status;
SELECT COUNT(*) as total_trips FROM trips;
SELECT title, location, price, start_date, end_date FROM trips ORDER BY created_at DESC LIMIT 3; 