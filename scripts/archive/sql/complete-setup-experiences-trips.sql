-- Complete Setup Script for Experiences and Trips
-- This script drops and recreates the tables with the correct structure

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;

-- Step 2: Create experiences table with correct structure
CREATE TABLE public.experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 10,
  images TEXT[],
  image TEXT,
  duration TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create trips table with correct structure
CREATE TABLE public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 10,
  images TEXT[],
  image TEXT,
  duration TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Insert sample experiences data
INSERT INTO public.experiences (
  title, 
  location, 
  description, 
  image, 
  price, 
  date,
  max_guests,
  images,
  is_active,
  created_at, 
  updated_at
) VALUES
(
  'Yoga by the Ganges',
  'Rishikesh, Uttarakhand',
  'Experience the spiritual energy of Rishikesh with a guided yoga session by the sacred Ganges River. Perfect for beginners and advanced practitioners.',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  1500,
  '2024-12-25',
  8,
  ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'White Water Rafting',
  'Rishikesh, Uttarakhand',
  'Thrilling white water rafting experience on the Ganges River. Professional guides ensure your safety while you enjoy the adventure.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  2500,
  '2024-12-26',
  6,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Temple Trail Walk',
  'Varanasi, Uttar Pradesh',
  'Explore the ancient temples and ghats of Varanasi with a knowledgeable local guide. Experience the spiritual essence of the city.',
  'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
  1200,
  '2024-12-27',
  10,
  ARRAY['https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Cooking Class - North Indian',
  'Delhi, India',
  'Learn to cook authentic North Indian dishes from a professional chef. Includes market visit and all ingredients.',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
  1800,
  '2024-12-28',
  6,
  ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Sunrise at Taj Mahal',
  'Agra, Uttar Pradesh',
  'Witness the magical sunrise at the iconic Taj Mahal. Beat the crowds and capture stunning photographs.',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  2200,
  '2024-12-29',
  8,
  ARRAY['https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Backwater Houseboat',
  'Alleppey, Kerala',
  'Cruise through the serene backwaters of Kerala on a traditional houseboat. Includes meals and overnight stay.',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  3500,
  '2024-12-30',
  4,
  ARRAY['https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Spice Plantation Tour',
  'Munnar, Kerala',
  'Visit a working spice plantation and learn about various spices. Includes tea tasting and traditional lunch.',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
  1600,
  '2024-12-31',
  12,
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Desert Safari',
  'Jaisalmer, Rajasthan',
  'Experience the magic of the Thar Desert with a camel safari, traditional music, and dinner under the stars.',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
  2800,
  '2025-01-01',
  8,
  ARRAY['https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
);

-- Step 5: Insert sample trips data
INSERT INTO public.trips (
  title, 
  location, 
  description, 
  image, 
  price, 
  start_date,
  end_date,
  max_guests,
  images,
  is_active,
  created_at, 
  updated_at
) VALUES
(
  'Golden Triangle Tour',
  'Delhi, Agra, Jaipur',
  'Experience the best of North India with this classic circuit. Visit the iconic Taj Mahal, explore the Pink City, and discover the capital.',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
  8500,
  '2024-12-25',
  '2024-12-29',
  12,
  ARRAY['https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Goa Beach Getaway',
  'Goa',
  'Relax on pristine beaches and enjoy vibrant nightlife. Experience the perfect blend of Portuguese heritage and Indian culture.',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  6500,
  '2024-12-26',
  '2024-12-29',
  8,
  ARRAY['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Kerala Backwaters',
  'Alleppey, Kerala',
  'Cruise through the tranquil backwaters on a traditional houseboat. Experience the serene beauty of God''s Own Country.',
  'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
  9000,
  '2024-12-27',
  '2024-12-29',
  6,
  ARRAY['https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Himalayan Adventure',
  'Leh, Ladakh',
  'Thrilling road trip through the majestic Himalayas. Experience high-altitude adventure and Buddhist culture.',
  'https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80',
  12000,
  '2024-12-28',
  '2025-01-03',
  10,
  ARRAY['https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Rajasthan Heritage Tour',
  'Jaipur, Jodhpur, Udaipur',
  'Explore the royal heritage of Rajasthan. Visit magnificent palaces, forts, and experience the regal lifestyle.',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  11000,
  '2024-12-29',
  '2025-01-03',
  8,
  ARRAY['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'South India Temple Trail',
  'Chennai, Madurai, Rameshwaram',
  'Discover the spiritual heritage of South India. Visit ancient temples and experience traditional rituals.',
  'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
  7500,
  '2024-12-30',
  '2025-01-03',
  10,
  ARRAY['https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Northeast Discovery',
  'Guwahati, Shillong, Kaziranga',
  'Explore the unexplored beauty of Northeast India. Visit tea gardens, wildlife sanctuaries, and tribal villages.',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
  9500,
  '2024-12-31',
  '2025-01-05',
  6,
  ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
),
(
  'Mumbai to Goa Coastal Drive',
  'Mumbai, Ratnagiri, Goa',
  'Drive along the scenic Konkan coast. Experience the beauty of the Western Ghats and pristine beaches.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  8000,
  '2025-01-01',
  '2025-01-04',
  8,
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'],
  true,
  NOW(),
  NOW()
);

-- Step 6: Add duration field to trips (calculated from start_date and end_date)
UPDATE public.trips 
SET duration = CONCAT(
  (end_date::date - start_date::date)::text, 
  ' Days / ', 
  ((end_date::date - start_date::date) - 1)::text, 
  ' Nights'
);

-- Step 7: Create indexes for better performance
CREATE INDEX idx_experiences_host_id ON public.experiences(host_id);
CREATE INDEX idx_experiences_date ON public.experiences(date);
CREATE INDEX idx_experiences_location ON public.experiences(location);

CREATE INDEX idx_trips_host_id ON public.trips(host_id);
CREATE INDEX idx_trips_dates ON public.trips(start_date, end_date);
CREATE INDEX idx_trips_location ON public.trips(location);

-- Step 8: Verify the data
SELECT 'Experiences Count:' as info, COUNT(*) as count FROM public.experiences;

SELECT 'Trips Count:' as info, COUNT(*) as count FROM public.trips;

-- Step 9: Show sample data
SELECT 'Sample Experiences:' as info, '' as data;

SELECT title, location FROM public.experiences LIMIT 3;

SELECT 'Sample Trips:' as info, '' as data;

SELECT title, location FROM public.trips LIMIT 3; 