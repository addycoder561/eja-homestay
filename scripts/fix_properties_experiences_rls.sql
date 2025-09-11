-- Fix RLS policies on properties and experiences tables
-- These tables are blocking the unified_search_view
-- Run this script in Supabase SQL Editor

-- Step 1: Check current policies on properties table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'properties'
ORDER BY policyname;

-- Step 2: Check current policies on experiences table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'experiences'
ORDER BY policyname;

-- Step 3: Add public read access policy for properties table
DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
CREATE POLICY "Allow public read access" ON public.properties
    FOR SELECT USING (true);

-- Step 4: Add public read access policy for experiences table
DROP POLICY IF EXISTS "Allow public read access" ON public.experiences;
CREATE POLICY "Allow public read access" ON public.experiences
    FOR SELECT USING (true);

-- Step 5: Test the view now
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;

-- Step 6: Verify all tables are accessible
SELECT 'properties' as table_name, COUNT(*) as count FROM public.properties;
SELECT 'experiences' as table_name, COUNT(*) as count FROM public.experiences;
SELECT 'retreats' as table_name, COUNT(*) as count FROM public.retreats;
