-- Manual Profile Fix Script
-- Run this directly in your Supabase SQL Editor

-- Step 1: Check current profile
SELECT 'Current profile data:' as info;
SELECT id, email, full_name, created_at, updated_at 
FROM profiles 
WHERE email = 'adityawardhanaryavanshi@gmail.com';

-- Step 2: Update profile to correct data
UPDATE profiles 
SET 
  full_name = 'Aditya Arya',
  email = 'adityawardhanaryavanshi@gmail.com',
  updated_at = NOW()
WHERE email = 'adityawardhanaryavanshi@gmail.com';

-- Step 3: If no profile exists, create one
INSERT INTO profiles (id, email, full_name, is_host, created_at, updated_at)
SELECT 
  '985c70b3-0d69-4690-8f9a-4d800184839c',
  'adityawardhanaryavanshi@gmail.com',
  'Aditya Arya',
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'adityawardhanaryavanshi@gmail.com'
);

-- Step 4: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Step 6: Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- Step 7: Verify the fix
SELECT 'Final profile data:' as info;
SELECT id, email, full_name, created_at, updated_at 
FROM profiles 
WHERE email = 'adityawardhanaryavanshi@gmail.com';
