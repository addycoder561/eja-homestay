-- Comprehensive RLS Setup Script for EJA Homestay (FIXED)
-- This script enables RLS and sets policies for all tables based on actual structure

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Enable RLS on experiences table  
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

-- Enable RLS on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bookmarks table
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PROPERTIES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Properties can be created by authenticated users" ON properties;
DROP POLICY IF EXISTS "Properties can be updated by host" ON properties;
DROP POLICY IF EXISTS "Properties can be deleted by host" ON properties;

-- Policy to allow everyone to view properties
CREATE POLICY "Properties are viewable by everyone" ON properties
  FOR SELECT USING (true);

-- Policy to allow authenticated users to create properties
CREATE POLICY "Properties can be created by authenticated users" ON properties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow hosts to update their own properties
CREATE POLICY "Properties can be updated by host" ON properties
  FOR UPDATE USING (auth.uid() = host_id);

-- Policy to allow hosts to delete their own properties
CREATE POLICY "Properties can be deleted by host" ON properties
  FOR DELETE USING (auth.uid() = host_id);

-- =====================================================
-- 3. EXPERIENCES TABLE POLICIES (FIXED - using host_id)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Experiences are viewable by everyone" ON experiences;
DROP POLICY IF EXISTS "Experiences can be created by authenticated users" ON experiences;
DROP POLICY IF EXISTS "Experiences can be updated by host" ON experiences;
DROP POLICY IF EXISTS "Experiences can be deleted by host" ON experiences;

-- Policy to allow everyone to view experiences
CREATE POLICY "Experiences are viewable by everyone" ON experiences
  FOR SELECT USING (true);

-- Policy to allow authenticated users to create experiences
CREATE POLICY "Experiences can be created by authenticated users" ON experiences
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow hosts to update their own experiences
CREATE POLICY "Experiences can be updated by host" ON experiences
  FOR UPDATE USING (auth.uid() = host_id);

-- Policy to allow hosts to delete their own experiences
CREATE POLICY "Experiences can be deleted by host" ON experiences
  FOR DELETE USING (auth.uid() = host_id);

-- =====================================================
-- 4. TRIPS TABLE POLICIES (FIXED - using host_id)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Trips are viewable by everyone" ON trips;
DROP POLICY IF EXISTS "Trips can be created by authenticated users" ON trips;
DROP POLICY IF EXISTS "Trips can be updated by host" ON trips;
DROP POLICY IF EXISTS "Trips can be deleted by host" ON trips;

-- Policy to allow everyone to view trips
CREATE POLICY "Trips are viewable by everyone" ON trips
  FOR SELECT USING (true);

-- Policy to allow authenticated users to create trips
CREATE POLICY "Trips can be created by authenticated users" ON trips
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow hosts to update their own trips
CREATE POLICY "Trips can be updated by host" ON trips
  FOR UPDATE USING (auth.uid() = host_id);

-- Policy to allow hosts to delete their own trips
CREATE POLICY "Trips can be deleted by host" ON trips
  FOR DELETE USING (auth.uid() = host_id);

-- =====================================================
-- 5. BOOKMARKS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;

-- Policy to allow users to read their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Policy to allow users to update their own bookmarks (if needed)
CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 7. BOOKINGS TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

-- Policy to allow users to view their own bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = guest_id);

-- Policy to allow users to create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

-- Policy to allow hosts to view bookings for their properties
CREATE POLICY "Hosts can view bookings for their properties" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = bookings.property_id 
      AND properties.host_id = auth.uid()
    )
  );

-- Policy to allow users to update their own bookings
CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = guest_id);

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'experiences', 'trips', 'bookmarks', 'profiles', 'bookings')
ORDER BY tablename;

-- Check policies for each table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'experiences', 'trips', 'bookmarks', 'profiles', 'bookings')
ORDER BY tablename, policyname; 