-- Update retreats table: Remove subtitle column and set host_image to EJA logo
-- This script handles the unified_search_view dependency issue
-- Run this script in Supabase SQL Editor

-- Step 1: Drop the problematic materialized view first (if it exists)
DROP MATERIALIZED VIEW IF EXISTS public.property_stats CASCADE;
DROP FUNCTION IF EXISTS public.refresh_property_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_property_stats() CASCADE;

-- Step 2: Drop the unified_search_view that depends on subtitle column
DROP VIEW IF EXISTS public.unified_search_view;

-- Step 3: Remove the subtitle column from retreats table
ALTER TABLE public.retreats DROP COLUMN IF EXISTS subtitle;

-- Step 4: Update all host_image columns with EJA logo URL
UPDATE public.retreats 
SET host_image = 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png'
WHERE host_image IS NULL OR host_image = '';

-- Step 5: Recreate the unified_search_view with NULL for retreats subtitle
CREATE VIEW public.unified_search_view AS
SELECT 
    'property' as type,
    id,
    title,
    description,
    price_per_night as price,
    city as location,
    images::text[],
    property_type as categories,
    created_at,
    updated_at,
    NULL as subtitle,
    NULL as duration
FROM public.properties
WHERE is_available = true

UNION ALL

SELECT 
    'experience' as type,
    id,
    title,
    description,
    price,
    location,
    images::text[],
    categories::text,
    created_at,
    updated_at,
    NULL as subtitle,
    duration
FROM public.experiences
WHERE is_active = true

UNION ALL

SELECT 
    'retreat' as type,
    id,
    title,
    description,
    price,
    location,
    images::text[],
    categories::text,
    created_at,
    updated_at,
    NULL as subtitle,
    NULL as duration
FROM public.retreats
WHERE is_active = true;

-- Step 6: Verify the changes
SELECT 
    id,
    title,
    host_name,
    host_image,
    created_at
FROM public.retreats 
ORDER BY created_at DESC
LIMIT 5;

-- Step 7: Check if subtitle column was successfully removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'retreats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 8: Verify unified_search_view is working
SELECT type, title, subtitle, duration 
FROM public.unified_search_view 
WHERE type = 'retreat'
LIMIT 3;
