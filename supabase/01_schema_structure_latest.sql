-- =====================================================
-- EJA HOMESTAY - Database Schema Structure (LATEST)
-- =====================================================
-- This script creates all 15 tables with correct column structure,
-- foreign keys, indexes, and RLS policies based on actual database.
--
-- Run this script FIRST before inserting data.
-- Run in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS AND CUSTOM TYPES
-- =====================================================

-- Booking Type Enum
DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM ('property', 'experience', 'retreat');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Booking Status Enum
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Property Type Enum
DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM ('Boutique', 'Cottage', 'Homely', 'Off-Beat');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Item Type Enum (for bucketlist)
DO $$ BEGIN
  CREATE TYPE item_type_enum AS ENUM ('property', 'experience', 'retreat');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  host_bio TEXT,
  host_usps TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. PROPERTIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  property_type property_type_enum NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  base_price NUMERIC NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  amenities TEXT[],
  cover_image TEXT,
  gallery JSONB,
  usps TEXT[],
  house_rules TEXT,
  cancellation_policy TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accommodation_type TEXT,
  beds INTEGER,
  currency TEXT DEFAULT 'INR',
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER,
  google_average_rating NUMERIC,
  google_reviews_count INTEGER DEFAULT 0
);

-- RLS Policies for properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available properties" ON properties
  FOR SELECT USING (is_available = true);

CREATE POLICY "Hosts can view their own properties" ON properties
  FOR SELECT USING (auth.uid()::text = host_id);

CREATE POLICY "Hosts can insert their own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid()::text = host_id);

CREATE POLICY "Hosts can update their own properties" ON properties
  FOR UPDATE USING (auth.uid()::text = host_id);

CREATE POLICY "Hosts can delete their own properties" ON properties
  FOR DELETE USING (auth.uid()::text = host_id);

-- =====================================================
-- 3. ROOMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  description TEXT,
  max_guests INTEGER NOT NULL,
  base_price NUMERIC NOT NULL,
  amenities TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cover_image TEXT,
  gallery JSONB
);

-- RLS Policies for rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rooms" ON rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage rooms for their properties" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = rooms.property_id 
      AND properties.host_id = auth.uid()::text
    )
  );

-- =====================================================
-- 4. ROOM_INVENTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS room_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for room_inventory
ALTER TABLE room_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view room inventory" ON room_inventory
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage inventory for their rooms" ON room_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms
      JOIN properties ON properties.id = rooms.property_id
      WHERE rooms.id = room_inventory.room_id
      AND properties.host_id = auth.uid()::text
    )
  );

-- =====================================================
-- 5. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_type booking_type NOT NULL,
  item_id UUID NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  guests_count INTEGER,
  total_price NUMERIC NOT NULL,
  status booking_status DEFAULT 'pending'::booking_status,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. EXPERIENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  mood TEXT,
  price NUMERIC NOT NULL,
  duration_hours INTEGER,
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  host_name TEXT DEFAULT 'EJA',
  host_avatar TEXT DEFAULT 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png'
);

-- RLS Policies for experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active experiences" ON experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can view their own experiences" ON experiences
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own experiences" ON experiences
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own experiences" ON experiences
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own experiences" ON experiences
  FOR DELETE USING (auth.uid() = host_id);

-- =====================================================
-- 7. MICRO_EXPERIENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS micro_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  experience_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cover_image TEXT,
  gallery JSONB
);

-- RLS Policies for micro_experiences
ALTER TABLE micro_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active micro_experiences" ON micro_experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage micro_experiences for their retreats" ON micro_experiences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = micro_experiences.retreat_id
      AND experiences.host_id = auth.uid()
    )
  );

-- =====================================================
-- 8. TALES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL,
  guest_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT,
  video_url TEXT
);

-- RLS Policies for tales
ALTER TABLE tales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tales" ON tales
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own tales" ON tales
  FOR INSERT WITH CHECK (auth.uid() = guest_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own tales" ON tales
  FOR UPDATE USING (auth.uid() = guest_id);

CREATE POLICY "Users can delete their own tales" ON tales
  FOR DELETE USING (auth.uid() = guest_id);

-- =====================================================
-- 9. DARES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hashtag TEXT,
  vibe TEXT NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for dares
ALTER TABLE dares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active dares" ON dares
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own dares" ON dares
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Users can create their own dares" ON dares
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own dares" ON dares
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own dares" ON dares
  FOR DELETE USING (auth.uid() = creator_id);

-- =====================================================
-- 10. COMPLETED_DARES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS completed_dares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dare_id UUID REFERENCES dares(id) ON DELETE SET NULL,
  completer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  media_urls TEXT[] NOT NULL,
  caption TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for completed_dares
ALTER TABLE completed_dares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active completed dares" ON completed_dares
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own completed dares" ON completed_dares
  FOR SELECT USING (auth.uid() = completer_id);

CREATE POLICY "Users can create their own completed dares" ON completed_dares
  FOR INSERT WITH CHECK (auth.uid() = completer_id);

CREATE POLICY "Users can update their own completed dares" ON completed_dares
  FOR UPDATE USING (auth.uid() = completer_id);

CREATE POLICY "Users can delete their own completed dares" ON completed_dares
  FOR DELETE USING (auth.uid() = completer_id);

-- =====================================================
-- 11. DARE_ENGAGEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dare_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  dare_id UUID REFERENCES dares(id) ON DELETE SET NULL,
  completed_dare_id UUID REFERENCES completed_dares(id) ON DELETE SET NULL,
  engagement_type TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  item_id UUID,
  item_type VARCHAR,
  engagement_value VARCHAR
);

-- RLS Policies for dare_engagements
ALTER TABLE dare_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view engagements" ON dare_engagements
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own engagements" ON dare_engagements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagements" ON dare_engagements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own engagements" ON dare_engagements
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 12. BUCKETLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bucketlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type item_type_enum NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- RLS Policies for bucketlist
ALTER TABLE bucketlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bucketlist" ON bucketlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bucketlist" ON bucketlist
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 13. FOLLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- RLS Policies for follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON follows
  FOR ALL USING (auth.uid() = follower_id);

-- =====================================================
-- 14. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 15. BLOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  cover_image TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs" ON blogs
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can view their own blogs" ON blogs
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can manage their own blogs" ON blogs
  FOR ALL USING (auth.uid() = author_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_host ON profiles(is_host);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);

-- Room inventory indexes
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_id ON room_inventory(room_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_is_available ON room_inventory(is_available);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_item_id ON bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Experiences indexes
CREATE INDEX IF NOT EXISTS idx_experiences_host_id ON experiences(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences(location);
CREATE INDEX IF NOT EXISTS idx_experiences_is_active ON experiences(is_active);

-- Micro experiences indexes
CREATE INDEX IF NOT EXISTS idx_micro_experiences_retreat_id ON micro_experiences(retreat_id);
CREATE INDEX IF NOT EXISTS idx_micro_experiences_type ON micro_experiences(experience_type);

-- Tales indexes
CREATE INDEX IF NOT EXISTS idx_tales_experience_id ON tales(experience_id);
CREATE INDEX IF NOT EXISTS idx_tales_guest_id ON tales(guest_id);

-- Dares indexes
CREATE INDEX IF NOT EXISTS idx_dares_creator_id ON dares(creator_id);
CREATE INDEX IF NOT EXISTS idx_dares_vibe ON dares(vibe);
CREATE INDEX IF NOT EXISTS idx_dares_expiry_date ON dares(expiry_date);
CREATE INDEX IF NOT EXISTS idx_dares_is_active ON dares(is_active);

-- Completed dares indexes
CREATE INDEX IF NOT EXISTS idx_completed_dares_dare_id ON completed_dares(dare_id);
CREATE INDEX IF NOT EXISTS idx_completed_dares_completer_id ON completed_dares(completer_id);
CREATE INDEX IF NOT EXISTS idx_completed_dares_is_active ON completed_dares(is_active);

-- Dare engagements indexes
CREATE INDEX IF NOT EXISTS idx_dare_engagements_user_id ON dare_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_dare_engagements_item_id ON dare_engagements(item_id, item_type) WHERE item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dare_engagements_dare_id ON dare_engagements(dare_id) WHERE dare_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dare_engagements_completed_dare_id ON dare_engagements(completed_dare_id) WHERE completed_dare_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dare_engagements_type ON dare_engagements(engagement_type);

-- Bucketlist indexes
CREATE INDEX IF NOT EXISTS idx_bucketlist_user_id ON bucketlist(user_id);
CREATE INDEX IF NOT EXISTS idx_bucketlist_item ON bucketlist(item_id, item_type);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Blogs indexes
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_inventory_updated_at BEFORE UPDATE ON room_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_micro_experiences_updated_at BEFORE UPDATE ON micro_experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tales_updated_at BEFORE UPDATE ON tales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dares_updated_at BEFORE UPDATE ON dares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completed_dares_updated_at BEFORE UPDATE ON completed_dares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'properties', 'rooms', 'room_inventory', 'bookings',
    'experiences', 'micro_experiences', 'tales', 'dares', 'completed_dares',
    'dare_engagements', 'bucketlist', 'follows', 'notifications', 'blogs'
  );
  
  IF table_count = 15 THEN
    RAISE NOTICE '✓ Successfully created all 15 tables';
  ELSE
    RAISE WARNING '✗ Expected 15 tables, found %', table_count;
  END IF;
END $$;

