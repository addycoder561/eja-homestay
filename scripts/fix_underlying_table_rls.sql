-- Fix RLS policies on underlying tables for unified_search_view
-- The view inherits RLS from properties, experiences, and retreats tables
-- Run this script in Supabase SQL Editor

-- Step 1: Check RLS status on all underlying tables
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE tablename IN ('properties', 'experiences', 'retreats')
ORDER BY tablename;

-- Step 2: Check existing policies on underlying tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('properties', 'experiences', 'retreats')
ORDER BY tablename, policyname;

-- Step 3: Disable RLS temporarily on underlying tables to test
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.retreats DISABLE ROW LEVEL SECURITY;

-- Step 4: Test the view now
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;

-- Step 5: Re-enable RLS with proper policies
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple RLS policies that allow public read access
-- Properties table
DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
CREATE POLICY "Allow public read access" ON public.properties
    FOR SELECT USING (true);

-- Experiences table  
DROP POLICY IF EXISTS "Allow public read access" ON public.experiences;
CREATE POLICY "Allow public read access" ON public.experiences
    FOR SELECT USING (true);

-- Retreats table
DROP POLICY IF EXISTS "Allow public read access" ON public.retreats;
CREATE POLICY "Allow public read access" ON public.retreats
    FOR SELECT USING (true);

-- Step 7: Test the view again
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;

-- Step 8: Final verification
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE tablename IN ('properties', 'experiences', 'retreats')
ORDER BY tablename;
