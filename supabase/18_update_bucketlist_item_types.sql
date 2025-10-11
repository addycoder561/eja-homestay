-- =====================================================
-- EJA Homestay - Update Bucketlist Item Types
-- =====================================================
-- This script updates the bucketlist table to support the new item types:
-- 'experiences' (for hyper-local, online, retreats)
-- 'stays' (for properties)
-- =====================================================

-- Step 1: Update existing records to use new item types
-- Update all 'experience' records to 'experiences'
UPDATE public.bucketlist 
SET item_type = 'experiences' 
WHERE item_type = 'experience';

-- Update all 'retreat' records to 'experiences'  
UPDATE public.bucketlist 
SET item_type = 'experiences' 
WHERE item_type = 'retreat';

-- Update all 'property' records to 'stays'
UPDATE public.bucketlist 
SET item_type = 'stays' 
WHERE item_type = 'property';

-- Step 2: Add a check constraint to ensure only valid item types are allowed
ALTER TABLE public.bucketlist 
DROP CONSTRAINT IF EXISTS check_item_type;

ALTER TABLE public.bucketlist 
ADD CONSTRAINT check_item_type 
CHECK (item_type IN ('experiences', 'stays'));

-- Step 3: Update the comment to reflect the new item types
COMMENT ON TABLE public.bucketlist IS 'User bucketlist items - supports experiences (hyper-local, online, retreats) and stays (properties)';

-- Step 4: Create an index for better performance on the new item types
CREATE INDEX IF NOT EXISTS idx_bucketlist_item_type_new ON public.bucketlist(item_type);

-- Step 5: Update RLS policies to ensure they work with the new structure
-- Drop and recreate the policies to ensure they're up to date
DROP POLICY IF EXISTS "Users can manage their own bucketlist" ON public.bucketlist;
DROP POLICY IF EXISTS "Users can view their own bucketlist" ON public.bucketlist;

CREATE POLICY "Users can manage their own bucketlist" ON public.bucketlist 
FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own bucketlist" ON public.bucketlist 
FOR SELECT USING (auth.uid()::text = user_id::text);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bucketlist item types updated successfully!';
  RAISE NOTICE '🔄 Updated existing records: experience→experiences, retreat→experiences, property→stays';
  RAISE NOTICE '✅ Added constraint to ensure only valid item types: experiences, stays';
  RAISE NOTICE '📊 Created index for better performance';
  RAISE NOTICE '🔒 Updated RLS policies for new structure';
  RAISE NOTICE '🎯 Bucketlist is now ready for the new item type system!';
END $$;
