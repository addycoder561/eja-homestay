-- Verify and update host_image column in retreats table
-- Run this script in Supabase SQL Editor

-- Step 1: Check current host_image values
SELECT 
    id,
    title,
    host_name,
    host_image,
    created_at
FROM public.retreats 
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Update ALL host_image columns with EJA logo URL (not just NULL/empty ones)
UPDATE public.retreats 
SET host_image = 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png';

-- Step 3: Verify the update
SELECT 
    id,
    title,
    host_name,
    host_image,
    created_at
FROM public.retreats 
ORDER BY created_at DESC
LIMIT 10;

-- Step 4: Count how many rows were updated
SELECT 
    COUNT(*) as total_retreats,
    COUNT(CASE WHEN host_image = 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png' THEN 1 END) as updated_with_eja_logo
FROM public.retreats;
