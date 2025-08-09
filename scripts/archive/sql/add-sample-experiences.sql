-- Add sample experiences data
-- This script assumes the experiences table exists with the correct structure
-- If you get errors, run the complete setup script first

-- First, let's check if the table exists and has the right structure
DO $$
BEGIN
  -- Check if experiences table exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'experiences') THEN
    RAISE EXCEPTION 'Experiences table does not exist. Please run the complete setup script first.';
  END IF;
  
  -- Check if required columns exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'date') THEN
    RAISE EXCEPTION 'date column does not exist in experiences table. Please run the complete setup script first.';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'experiences' AND column_name = 'max_guests') THEN
    RAISE EXCEPTION 'max_guests column does not exist in experiences table. Please run the complete setup script first.';
  END IF;
END $$;

-- Insert sample experiences data
INSERT INTO experiences (id, title, subtitle, description, location, date, price, max_guests, images, created_at, updated_at) VALUES
(
  'b3b1c2d4-1234-4a1b-9abc-111111111111',
  'Sunrise Mountain Hike',
  'Breathtaking Himalayan Views',
  'Start your day with a guided sunrise trek and breathtaking views of the Himalayas. Experience the magic of dawn breaking over snow-capped peaks.',
  'Manali, Himachal Pradesh',
  '2024-12-25',
  1200.00,
  8,
  ARRAY['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-222222222222',
  'Local Food Tasting Tour',
  'Authentic Rajasthani Cuisine',
  'Sample the best of Rajasthani cuisine with a local expert. Visit hidden gems and learn about traditional cooking methods.',
  'Jaipur, Rajasthan',
  '2024-12-26',
  900.00,
  12,
  ARRAY['https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-333333333333',
  'Pottery Workshop',
  'Hands-on Artisan Experience',
  'Get your hands dirty and create your own pottery masterpiece. Learn traditional techniques from skilled artisans.',
  'Pune, Maharashtra',
  '2024-12-27',
  700.00,
  6,
  ARRAY['https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-444444444444',
  'Old City Heritage Walk',
  'Ancient Stories & Traditions',
  'Explore the hidden gems and stories of the ancient city. Walk through narrow lanes and discover centuries-old traditions.',
  'Varanasi, Uttar Pradesh',
  '2024-12-28',
  500.00,
  15,
  ARRAY['https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-555555555555',
  'Yoga by the Ganges',
  'Spiritual Morning Session',
  'Experience the spiritual energy of Rishikesh with a sunrise yoga session by the sacred Ganges river.',
  'Rishikesh, Uttarakhand',
  '2024-12-29',
  800.00,
  10,
  ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-666666666666',
  'Spice Garden Tour',
  'Aromatic Tea & Spice Discovery',
  'Discover the aromatic world of spices in the lush hills of Munnar. Learn about tea and spice cultivation.',
  'Munnar, Kerala',
  '2024-12-30',
  600.00,
  8,
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-777777777777',
  'Desert Safari',
  'Golden Sand Dunes Adventure',
  'Experience the thrill of a desert safari on camelback. Watch the sunset over the golden sand dunes.',
  'Jaisalmer, Rajasthan',
  '2024-12-31',
  1500.00,
  6,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
),
(
  'b3b1c2d4-1234-4a1b-9abc-888888888888',
  'Traditional Dance Performance',
  'Graceful Rajasthani Dance',
  'Witness the grace and beauty of traditional Rajasthani dance forms in the romantic city of lakes.',
  'Udaipur, Rajasthan',
  '2025-01-01',
  400.00,
  20,
  ARRAY['https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Experiences inserted successfully!' as status;
SELECT COUNT(*) as total_experiences FROM experiences;
SELECT title, location, price, date, max_guests FROM experiences ORDER BY created_at DESC LIMIT 3; 