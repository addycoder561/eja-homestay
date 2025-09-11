-- Completely remove unified_search_view and clean up
-- Run this script in Supabase SQL Editor

-- Step 1: Drop regular view if it exists
DROP VIEW IF EXISTS public.unified_search_view CASCADE;

-- Step 2: Drop materialized view if it exists (in case it was created as materialized)
DROP MATERIALIZED VIEW IF EXISTS public.unified_search_view CASCADE;

-- Step 3: Remove any indexes related to the view
DROP INDEX IF EXISTS idx_unified_search_type;
DROP INDEX IF EXISTS idx_unified_search_categories;

-- Step 4: Verify it's completely removed
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE tablename = 'unified_search_view';

-- Step 5: Check for any remaining references
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'unified_search_view';

-- Step 6: Confirm removal
SELECT 'unified_search_view has been completely removed' as status;
