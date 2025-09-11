-- Fix malformed array literal error in unified_search_view
-- The issue is with empty arrays being converted to string literals
-- Run this script in Supabase SQL Editor

-- Step 1: Drop the existing view
DROP VIEW IF EXISTS public.unified_search_view;

-- Step 2: Recreate the view with proper array handling
CREATE VIEW public.unified_search_view AS
SELECT 
    'property' as type,
    id,
    title,
    description,
    price_per_night as price,
    city as location,
    images::text[],
    property_type::text as categories,
    created_at,
    updated_at,
    subtitle,
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
    CASE 
        WHEN categories IS NULL OR array_length(categories, 1) IS NULL THEN 'General'
        ELSE array_to_string(categories, ',')
    END as categories,
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
    COALESCE(categories, 'General') as categories,
    created_at,
    updated_at,
    NULL as subtitle,
    NULL as duration
FROM public.retreats
WHERE is_active = true;

-- Step 3: Grant permissions
GRANT SELECT ON public.unified_search_view TO authenticated;
GRANT SELECT ON public.unified_search_view TO anon;

-- Step 4: Test the view
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;

-- Step 5: Test with a small sample to check array handling
SELECT type, title, images FROM public.unified_search_view LIMIT 5;
