-- Fix RLS policies for unified_search_view
-- Run this script in Supabase SQL Editor

-- Step 1: Check current RLS status and policies
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE tablename = 'unified_search_view';

-- Check if there are any existing policies on the view
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'unified_search_view';

-- Step 2: Drop the view if it exists (to recreate with proper RLS)
DROP VIEW IF EXISTS public.unified_search_view;

-- Step 3: Recreate the unified_search_view
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

-- Step 4: Grant proper permissions to the view
GRANT SELECT ON public.unified_search_view TO authenticated;
GRANT SELECT ON public.unified_search_view TO anon;

-- Step 5: Test the view
SELECT 
    type,
    title,
    subtitle,
    duration,
    price
FROM public.unified_search_view 
LIMIT 5;

-- Step 6: Check if the view is working properly
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;
