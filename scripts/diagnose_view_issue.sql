-- Diagnose unified_search_view loading issue
-- Run this script in Supabase SQL Editor

-- Step 1: Test each underlying table individually
SELECT 'properties' as table_name, COUNT(*) as count FROM public.properties;
SELECT 'experiences' as table_name, COUNT(*) as count FROM public.experiences;
SELECT 'retreats' as table_name, COUNT(*) as count FROM public.retreats;

-- Step 2: Test the view with a simple query
SELECT COUNT(*) as total_items FROM public.unified_search_view;

-- Step 3: Test with a small sample
SELECT type, title, price FROM public.unified_search_view LIMIT 5;

-- Step 4: Check if it's a specific table causing issues
SELECT 'properties' as source, COUNT(*) as count FROM (
    SELECT id, title, description, price_per_night as price, city as location, images::text[], property_type as categories, created_at, updated_at, NULL as subtitle, NULL as duration
    FROM public.properties
    WHERE is_available = true
) as props;

SELECT 'experiences' as source, COUNT(*) as count FROM (
    SELECT id, title, description, price, location, images::text[], categories::text, created_at, updated_at, NULL as subtitle, duration
    FROM public.experiences
    WHERE is_active = true
) as exps;

SELECT 'retreats' as source, COUNT(*) as count FROM (
    SELECT id, title, description, price, location, images::text[], categories::text, created_at, updated_at, NULL as subtitle, NULL as duration
    FROM public.retreats
    WHERE is_active = true
) as rets;
