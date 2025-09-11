-- Recreate unified_search_view with proper RLS and correct schema
-- Based on actual table schemas from migrations
-- Run this script in Supabase SQL Editor

-- Step 1: Drop existing view
DROP VIEW IF EXISTS public.unified_search_view;

-- Step 2: Check if experiences table has RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE tablename IN ('properties', 'experiences', 'retreats')
ORDER BY tablename;

-- Step 3: Enable RLS on experiences table if not enabled
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for experiences table
DROP POLICY IF EXISTS "Experiences are viewable by everyone" ON public.experiences;
CREATE POLICY "Experiences are viewable by everyone" ON public.experiences
    FOR SELECT USING (is_active = true);

-- Step 5: Create RLS policies for properties table
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone" ON public.properties
    FOR SELECT USING (is_available = true);

-- Step 6: Create the unified_search_view with correct schema
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
        WHEN categories IS NULL THEN 'General'
        WHEN array_length(categories, 1) IS NULL THEN 'General'
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
    categories,
    created_at,
    updated_at,
    NULL as subtitle,
    NULL as duration
FROM public.retreats
WHERE is_active = true;

-- Step 7: Grant permissions on the view
GRANT SELECT ON public.unified_search_view TO authenticated;
GRANT SELECT ON public.unified_search_view TO anon;

-- Step 8: Test the view
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;

-- Step 9: Test individual tables
SELECT 'properties' as table_name, COUNT(*) as count FROM public.properties WHERE is_available = true;
SELECT 'experiences' as table_name, COUNT(*) as count FROM public.experiences WHERE is_active = true;
SELECT 'retreats' as table_name, COUNT(*) as count FROM public.retreats WHERE is_active = true;
