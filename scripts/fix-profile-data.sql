-- Fix Profile Data Script
-- This script updates the profile to match the auth user data

-- First, let's see what's in the profiles table
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
SELECT id, email, full_name, created_at, updated_at 
FROM profiles 
WHERE email = 'adityawardhanaryavanshi@gmail.com';
