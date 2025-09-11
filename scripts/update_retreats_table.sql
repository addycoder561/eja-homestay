-- Update retreats table: Remove subtitle column and set host_image to EJA logo
-- Run this script in Supabase SQL Editor

-- Step 1: Drop the subtitle column from retreats table
ALTER TABLE public.retreats DROP COLUMN IF EXISTS subtitle;

-- Step 2: Update all host_image columns with EJA logo URL
UPDATE public.retreats 
SET host_image = 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png'
WHERE host_image IS NULL OR host_image = '';

-- Step 3: Verify the changes
SELECT 
    id,
    title,
    host_name,
    host_image,
    created_at
FROM public.retreats 
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Check if subtitle column was successfully removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'retreats' 
AND table_schema = 'public'
ORDER BY ordinal_position;
