-- Fix Bookmarks Table Policies
-- Remove conflicting policies and keep only the correct ones

-- =====================================================
-- 1. DROP CONFLICTING POLICIES
-- =====================================================

-- Drop the problematic "Enable read access for all users" policy
DROP POLICY IF EXISTS "Enable read access for all users" ON bookmarks;

-- Drop the problematic "Enable insert for authenticated users only" policy  
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookmarks;

-- Drop the problematic "Enable delete for users based on user_id" policy
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON bookmarks;

-- =====================================================
-- 2. VERIFY CORRECT POLICIES REMAIN
-- =====================================================

-- The following policies should remain (these are correct):
-- - "Users can view their own bookmarks" (SELECT with auth.uid() = user_id)
-- - "Users can insert their own bookmarks" (INSERT with auth.uid() = user_id)  
-- - "Users can delete their own bookmarks" (DELETE with auth.uid() = user_id)
-- - "Users can update their own bookmarks" (UPDATE with auth.uid() = user_id)

-- =====================================================
-- 3. VERIFICATION QUERY
-- =====================================================

-- Check remaining bookmarks policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'bookmarks'
ORDER BY policyname; 