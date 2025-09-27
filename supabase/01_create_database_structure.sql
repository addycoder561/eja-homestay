-- =====================================================
-- EJA Homestay - Complete Database Structure
-- =====================================================
-- This script creates the complete database structure for EJA
-- including all tables, views, indexes, and RLS policies
-- 
-- IMPORTANT: Run this script in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  host_bio TEXT,
  host_usps TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  property_type TEXT NOT NULL, -- 'Boutique', 'Cottage', 'Homely', 'Off-Beat'
  accommodation_type TEXT, -- 'entire_place', 'private_room', 'shared_room'
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  base_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER,
  google_average_rating DECIMAL(3, 2),
  google_reviews_count INTEGER DEFAULT 0,
  amenities TEXT[],
  cover_image TEXT,
  gallery JSONB,
  usps TEXT[],
  house_rules TEXT,
  cancellation_policy TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table (room types within properties)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  description TEXT,
  max_guests INTEGER NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  amenities TEXT[],
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room inventory table (physical room instances)
CREATE TABLE IF NOT EXISTS public.room_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  room_number TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, room_number)
);

-- Experiences table (standalone experiences)
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  categories TEXT[],
  mood TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_hours INTEGER,
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreats table
CREATE TABLE IF NOT EXISTS public.retreats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  categories TEXT[],
  price DECIMAL(10, 2) NOT NULL,
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retreat experiences table (experiences tied to retreats)
CREATE TABLE IF NOT EXISTS public.retreat_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_id UUID REFERENCES public.retreats(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  experience_type TEXT NOT NULL, -- 'tight budget', 'family comfort', 'premium'
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UNIFIED TABLES
-- =====================================================

-- Unified bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_type TEXT NOT NULL, -- 'property', 'experience', 'retreat'
  item_id UUID NOT NULL, -- References property/experience/retreat
  check_in_date DATE,
  check_out_date DATE,
  guests_count INTEGER,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unified reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  review_type TEXT NOT NULL, -- 'property', 'experience', 'retreat'
  item_id UUID NOT NULL, -- References property/experience/retreat
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unified wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL, -- 'property', 'experience', 'retreat'
  item_id UUID NOT NULL, -- References property/experience/retreat
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- =====================================================
-- ENGAGEMENT & CONTENT TABLES
-- =====================================================

-- Shares table
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL, -- 'property', 'experience', 'retreat'
  item_id UUID NOT NULL, -- References property/experience/retreat
  platform TEXT, -- 'facebook', 'twitter', 'whatsapp', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  cover_image TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VIEWS
-- =====================================================

-- Room availability view
CREATE OR REPLACE VIEW public.room_availability_view WITH (security_invoker = on) AS
SELECT 
  ri.id as inventory_id,
  ri.room_id,
  r.property_id,
  ri.room_number,
  r.name as room_name,
  r.room_type,
  r.max_guests,
  r.base_price,
  ri.is_available,
  p.title as property_title,
  p.city,
  p.state
FROM public.room_inventory ri
JOIN public.rooms r ON ri.room_id = r.id
JOIN public.properties p ON r.property_id = p.id
WHERE ri.is_available = TRUE AND r.is_active = TRUE AND p.is_available = TRUE;

-- Property rooms summary view
CREATE OR REPLACE VIEW public.property_rooms_summary WITH (security_invoker = on) AS
SELECT 
  p.id as property_id,
  p.title as property_title,
  p.city,
  p.state,
  COUNT(DISTINCT r.id) as total_room_types,
  COUNT(DISTINCT ri.id) as total_rooms,
  MIN(r.base_price) as min_price,
  MAX(r.base_price) as max_price,
  ARRAY_AGG(DISTINCT r.room_type) as room_types
FROM public.properties p
LEFT JOIN public.rooms r ON p.id = r.property_id AND r.is_active = TRUE
LEFT JOIN public.room_inventory ri ON r.id = ri.room_id AND ri.is_available = TRUE
WHERE p.is_available = TRUE
GROUP BY p.id, p.title, p.city, p.state;

-- =====================================================
-- INDEXES
-- =====================================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON public.properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_available ON public.properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_base_price ON public.properties(base_price);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON public.rooms(is_active);

-- Room inventory indexes
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_id ON public.room_inventory(room_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_available ON public.room_inventory(is_available);

-- Experiences indexes
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON public.experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_active ON public.experiences(is_active);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON public.experiences(location);

-- Retreats indexes
CREATE INDEX IF NOT EXISTS idx_retreats_host_id ON public.retreats(host_id);
CREATE INDEX IF NOT EXISTS idx_retreats_active ON public.retreats(is_active);
CREATE INDEX IF NOT EXISTS idx_retreats_location ON public.retreats(location);

-- Retreat experiences indexes
CREATE INDEX IF NOT EXISTS idx_retreat_experiences_retreat_id ON public.retreat_experiences(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_experiences_type ON public.retreat_experiences(experience_type);
CREATE INDEX IF NOT EXISTS idx_retreat_experiences_active ON public.retreat_experiences(is_active);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_item_id ON public.bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON public.reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews(item_id);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_type ON public.wishlist(item_type);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_id ON public.wishlist(item_id);

-- Shares indexes
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON public.shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_type ON public.shares(item_type);
CREATE INDEX IF NOT EXISTS idx_shares_item_id ON public.shares(item_id);

-- Blogs indexes
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(published);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retreat_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Hosts can manage their own properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view active rooms" ON public.rooms;
DROP POLICY IF EXISTS "Property hosts can manage their rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can view available room inventory" ON public.room_inventory;
DROP POLICY IF EXISTS "Property hosts can manage room inventory" ON public.room_inventory;
DROP POLICY IF EXISTS "Anyone can view active experiences" ON public.experiences;
DROP POLICY IF EXISTS "Hosts can manage their experiences" ON public.experiences;
DROP POLICY IF EXISTS "Anyone can view active retreats" ON public.retreats;
DROP POLICY IF EXISTS "Hosts can manage their retreats" ON public.retreats;
DROP POLICY IF EXISTS "Anyone can view active retreat experiences" ON public.retreat_experiences;
DROP POLICY IF EXISTS "Retreat hosts can manage their experiences" ON public.retreat_experiences;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can manage their own shares" ON public.shares;
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can manage their blogs" ON public.blogs;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Properties policies
CREATE POLICY "Anyone can view available properties" ON public.properties
  FOR SELECT USING (is_available = true);

CREATE POLICY "Hosts can manage their own properties" ON public.properties
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Rooms policies
CREATE POLICY "Anyone can view active rooms" ON public.rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Property hosts can manage their rooms" ON public.rooms
  FOR ALL USING (
    property_id IN (
      SELECT id FROM public.properties WHERE auth.uid()::text = host_id::text
    )
  );

-- Room inventory policies
CREATE POLICY "Anyone can view available room inventory" ON public.room_inventory
  FOR SELECT USING (is_available = true);

CREATE POLICY "Property hosts can manage room inventory" ON public.room_inventory
  FOR ALL USING (
    room_id IN (
      SELECT r.id FROM public.rooms r
      JOIN public.properties p ON r.property_id = p.id
      WHERE auth.uid()::text = p.host_id::text
    )
  );

-- Experiences policies
CREATE POLICY "Anyone can view active experiences" ON public.experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their experiences" ON public.experiences
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Retreats policies
CREATE POLICY "Anyone can view active retreats" ON public.retreats
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their retreats" ON public.retreats
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Retreat experiences policies
CREATE POLICY "Anyone can view active retreat experiences" ON public.retreat_experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Retreat hosts can manage their experiences" ON public.retreat_experiences
  FOR ALL USING (
    retreat_id IN (
      SELECT id FROM public.retreats WHERE auth.uid()::text = host_id::text
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Shares policies
CREATE POLICY "Users can manage their own shares" ON public.shares
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Blogs policies
CREATE POLICY "Anyone can view published blogs" ON public.blogs
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can manage their blogs" ON public.blogs
  FOR ALL USING (auth.uid()::text = author_id::text);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
DROP TRIGGER IF EXISTS update_room_inventory_updated_at ON public.room_inventory;
DROP TRIGGER IF EXISTS update_experiences_updated_at ON public.experiences;
DROP TRIGGER IF EXISTS update_retreats_updated_at ON public.retreats;
DROP TRIGGER IF EXISTS update_retreat_experiences_updated_at ON public.retreat_experiences;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_inventory_updated_at
  BEFORE UPDATE ON public.room_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retreats_updated_at
  BEFORE UPDATE ON public.retreats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retreat_experiences_updated_at
  BEFORE UPDATE ON public.retreat_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Remove NOT NULL constraints from properties table (for existing installations)
ALTER TABLE public.properties
ALTER COLUMN host_id DROP NOT NULL,
ALTER COLUMN address DROP NOT NULL;

-- COMPLETION MESSAGE
-- =====================================================

-- This will show a success message when the script completes
DO $$
BEGIN
  RAISE NOTICE '✅ EJA Database structure created successfully!';
  RAISE NOTICE '📊 Created 12 tables + 2 views';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '📈 Indexes created for performance';
  RAISE NOTICE '🎯 Ready for data insertion';
END $$;