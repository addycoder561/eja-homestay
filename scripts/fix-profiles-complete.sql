-- Complete Profiles Fix Script
-- This script fixes profile data and sets up proper RLS policies

-- ========================================
-- PART 1: FIX PROFILE DATA
-- ========================================

-- First, let's see what's currently in the profiles table
SELECT 'Current profiles data:' as info;
SELECT id, email, full_name, created_at, updated_at 
FROM profiles 
WHERE email = 'adityawardhanaryavanshi@gmail.com';

-- Update the profile to match the auth user data
UPDATE profiles 
SET 
  full_name = 'Aditya Arya',
  email = 'adityawardhanaryavanshi@gmail.com',
  updated_at = NOW()
WHERE email = 'adityawardhanaryavanshi@gmail.com';

-- If no profile exists, create one
INSERT INTO profiles (id, email, full_name, is_host, created_at, updated_at)
SELECT 
  '985c70b3-0d69-4690-8f9a-4d800184839c', -- Your user ID from the logs
  'adityawardhanaryavanshi@gmail.com',
  'Aditya Arya',
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'adityawardhanaryavanshi@gmail.com'
);

-- Verify the update
SELECT 'After profile fix:' as info;
SELECT id, email, full_name, created_at, updated_at 
FROM profiles 
WHERE email = 'adityawardhanaryavanshi@gmail.com';

-- ========================================
-- PART 2: SETUP RLS POLICIES
-- ========================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (for new users)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 4: Public profiles are viewable by everyone (for basic info)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- ========================================
-- PART 3: VERIFICATION
-- ========================================

-- Verify RLS is enabled
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Show all policies on profiles table
SELECT 'Policies on profiles table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Final verification of profile data
SELECT 'Final profile data:' as info;
SELECT id, email, full_name, created_at, updated_at 
FROM profiles 
WHERE email = 'adityawardhanaryavanshi@gmail.com';
