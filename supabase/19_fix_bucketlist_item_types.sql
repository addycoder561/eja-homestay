-- =====================================================
-- EJA Homestay - Fix Bucketlist Item Types
-- =====================================================
-- This script fixes the bucketlist table to support the new item types
-- without requiring a full database reset
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

-- Step 2: Remove any existing check constraint and add a new one
ALTER TABLE public.bucketlist 
DROP CONSTRAINT IF EXISTS check_item_type;

ALTER TABLE public.bucketlist 
ADD CONSTRAINT check_item_type 
CHECK (item_type IN ('experiences', 'stays'));

-- Step 3: Update the table comment
COMMENT ON TABLE public.bucketlist IS 'User bucketlist items - supports experiences (hyper-local, online, retreats) and stays (properties)';

-- Step 4: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_bucketlist_item_type_new ON public.bucketlist(item_type);

-- Step 5: Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can manage their own bucketlist" ON public.bucketlist;
DROP POLICY IF EXISTS "Users can view their own bucketlist" ON public.bucketlist;

CREATE POLICY "Users can manage their own bucketlist" ON public.bucketlist 
FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own bucketlist" ON public.bucketlist 
FOR SELECT USING (auth.uid()::text = user_id::text);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bucketlist item types fixed successfully!';
  RAISE NOTICE '🔄 Updated existing records to new item types';
  RAISE NOTICE '✅ Added constraint for valid item types: experiences, stays';
  RAISE NOTICE '📊 Created performance index';
  RAISE NOTICE '🔒 Updated RLS policies';
  RAISE NOTICE '🎯 Bucketlist is now ready for the new system!';
END $$;
