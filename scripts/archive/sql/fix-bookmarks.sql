-- Fix Bookmarks Table Issues
-- This script checks and fixes common issues with the bookmarks table

-- 1. Check if bookmarks table exists and has the correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookmarks'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled on bookmarks table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'bookmarks';

-- 3. Check existing RLS policies on bookmarks table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'bookmarks';

-- 4. Count total bookmarks in the table
SELECT COUNT(*) as total_bookmarks FROM bookmarks;

-- 5. Show sample bookmarks data
SELECT * FROM bookmarks LIMIT 5;

-- 6. Check if there are any orphaned bookmarks (bookmarks without valid users)
SELECT 
  b.id,
  b.user_id,
  b.item_id,
  b.item_type,
  CASE 
    WHEN p.id IS NULL THEN 'Orphaned - User not found'
    ELSE 'Valid user'
  END as user_status
FROM bookmarks b
LEFT JOIN profiles p ON b.user_id = p.id
LIMIT 10;

-- 7. Check if there are any orphaned property bookmarks
SELECT 
  b.id,
  b.user_id,
  b.item_id,
  b.item_type,
  CASE 
    WHEN prop.id IS NULL THEN 'Orphaned - Property not found'
    ELSE 'Valid property'
  END as property_status
FROM bookmarks b
LEFT JOIN properties prop ON b.item_id = prop.id
WHERE b.item_type = 'property'
LIMIT 10;

-- 8. If RLS is enabled but no policies exist, temporarily disable RLS for testing
-- (Uncomment the line below if you need to temporarily disable RLS)
-- ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- 9. If you want to enable RLS with proper policies, run this:
-- ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view their own bookmarks" ON bookmarks
--   FOR SELECT USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
--   FOR DELETE USING (auth.uid() = user_id); 