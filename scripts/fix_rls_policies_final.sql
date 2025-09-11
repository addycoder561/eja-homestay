-- Fix RLS policies to allow public access to properties and experiences
-- Run this script in Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasrules
FROM pg_tables 
WHERE tablename IN ('properties', 'experiences', 'retreats')
ORDER BY tablename;

-- Step 2: Check existing policies
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

-- Step 3: Drop all existing policies and recreate them
-- Properties table
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
DROP POLICY IF EXISTS "Properties are publicly readable" ON public.properties;

-- Experiences table
DROP POLICY IF EXISTS "Experiences are viewable by everyone" ON public.experiences;
DROP POLICY IF EXISTS "Allow public read access" ON public.experiences;
DROP POLICY IF EXISTS "Experiences are publicly readable" ON public.experiences;

-- Step 4: Create simple public read policies
CREATE POLICY "Properties are publicly readable" ON public.properties
    FOR SELECT USING (true);

CREATE POLICY "Experiences are publicly readable" ON public.experiences
    FOR SELECT USING (true);

-- Step 5: Test individual tables
SELECT 'properties' as table_name, COUNT(*) as count FROM public.properties;
SELECT 'experiences' as table_name, COUNT(*) as count FROM public.experiences;
SELECT 'retreats' as table_name, COUNT(*) as count FROM public.retreats;

-- Step 6: Test the unified view
SELECT COUNT(*) as total_items FROM public.unified_search_view;
SELECT type, COUNT(*) as count FROM public.unified_search_view GROUP BY type;
