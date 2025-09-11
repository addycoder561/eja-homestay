-- Create a materialized view instead of a regular view to avoid array literal issues
-- Materialized views store data physically and avoid real-time array processing issues
-- Run this script in Supabase SQL Editor

-- Step 1: Drop existing view
DROP VIEW IF EXISTS public.unified_search_view;

-- Step 2: Create materialized view with simple text concatenation
CREATE MATERIALIZED VIEW public.unified_search_view AS
SELECT 
    'property' as type,
    id,
    title,
    description,
    price_per_night as price,
    city as location,
    CASE 
        WHEN images IS NULL THEN '[]'
        ELSE '[' || array_to_string(images, '","') || ']'
    END as images,
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
    CASE 
        WHEN images IS NULL THEN '[]'
        ELSE '[' || array_to_string(images, '","') || ']'
    END as images,
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
    CASE 
        WHEN images IS NULL THEN '[]'
        ELSE '[' || array_to_string(images, '","') || ']'
    END as images,
    COALESCE(categories, 'General') as categories,
    created_at,
    updated_at,
    NULL as subtitle,
    NULL as duration
FROM public.retreats
WHERE is_active = true;

-- Step 3: Create index for better performance
CREATE INDEX idx_unified_search_type ON public.unified_search_view(type);
CREATE INDEX idx_unified_search_categories ON public.unified_search_view(categories);

-- Step 4: Grant permissions
GRANT SELECT ON public.unified_search_view TO authenticated;
GRANT SELECT ON public.unified_search_view TO anon;

-- Step 5: Test the materialized view
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;

-- Step 6: Test with a small sample
SELECT type, title, images FROM public.unified_search_view LIMIT 3;
