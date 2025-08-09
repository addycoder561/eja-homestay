-- SQL Script to Rename Bookmarks to Wishlist
-- Run this script in your Supabase SQL Editor

-- Step 1: Drop existing RLS policies on bookmarks table
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;

-- Step 2: Rename the table from bookmarks to wishlist
ALTER TABLE bookmarks RENAME TO wishlist;

-- Step 3: Create new RLS policies for wishlist table
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own wishlist items
CREATE POLICY "Users can view their own wishlist" ON wishlist
FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist" ON wishlist
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist" ON wishlist
FOR DELETE USING (auth.uid() = user_id);

-- Policy to allow users to update their own wishlist items (if needed)
CREATE POLICY "Users can update their own wishlist" ON wishlist
FOR UPDATE USING (auth.uid() = user_id);

-- Step 4: Verify the changes
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'wishlist';

-- Step 5: Check RLS policies on the new table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'wishlist';

-- Step 6: Show sample data from the renamed table
SELECT * FROM wishlist LIMIT 5;

-- Step 7: Count total items in wishlist
SELECT COUNT(*) as total_wishlist_items FROM wishlist; 