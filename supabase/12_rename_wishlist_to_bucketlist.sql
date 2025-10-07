-- Rename wishlist table to bucketlist
-- This script renames the wishlist table to bucketlist to match the updated code

-- Step 1: Rename the table
ALTER TABLE public.wishlist RENAME TO bucketlist;

-- Step 2: Update RLS policies to reference the new table name
-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.bucketlist;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.bucketlist;

-- Create new policies with updated names
CREATE POLICY "Users can manage their own bucketlist" ON public.bucketlist 
FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own bucketlist" ON public.bucketlist 
FOR SELECT USING (auth.uid()::text = user_id::text);

-- Step 3: Update any indexes (if they exist)
-- Note: Index names will automatically update when the table is renamed

-- Step 4: Verify the table structure
-- You can run this to verify the table was renamed correctly:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bucketlist';

-- Step 5: Update any views or functions that reference the old table name
-- (Add any additional updates here if needed)

COMMENT ON TABLE public.bucketlist IS 'User bucketlist items - renamed from wishlist table';
