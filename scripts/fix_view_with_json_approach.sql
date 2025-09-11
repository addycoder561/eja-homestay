-- Fix unified_search_view by converting arrays to JSON to avoid array literal issues
-- This approach converts arrays to JSON strings to avoid malformed array literal errors
-- Run this script in Supabase SQL Editor

-- Step 1: Drop the existing view
DROP VIEW IF EXISTS public.unified_search_view;

-- Step 2: Create a simple view that converts arrays to JSON strings
CREATE VIEW public.unified_search_view AS
SELECT 
    'property' as type,
    id,
    title,
    description,
    price_per_night as price,
    city as location,
    to_json(CASE WHEN images IS NULL THEN ARRAY[]::text[] ELSE images::text[] END)::text as images,
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
    to_json(CASE WHEN images IS NULL THEN ARRAY[]::text[] ELSE images::text[] END)::text as images,
    CASE 
        WHEN categories IS NULL OR array_length(categories::text[], 1) IS NULL THEN 'General'
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
    to_json(CASE WHEN images IS NULL THEN ARRAY[]::text[] ELSE images::text[] END)::text as images,
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

-- Step 5: Test with a small sample
SELECT type, title, images FROM public.unified_search_view LIMIT 3;
