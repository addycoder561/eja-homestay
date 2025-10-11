-- =====================================================
-- EJA Homestay - Update Bucketlist Enum
-- =====================================================
-- This script updates the item_type enum to support new values
-- =====================================================

-- Step 1: Add new enum values to the existing enum type
-- First, let's add the new values to the enum
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'experiences';
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'stays';

-- Step 2: Update existing records to use new enum values
-- Update all 'experience' records to 'experiences'
UPDATE public.bucketlist 
SET item_type = 'experiences'::item_type 
WHERE item_type = 'experience'::item_type;

-- Update all 'retreat' records to 'experiences'  
UPDATE public.bucketlist 
SET item_type = 'experiences'::item_type 
WHERE item_type = 'retreat'::item_type;

-- Update all 'property' records to 'stays'
UPDATE public.bucketlist 
SET item_type = 'stays'::item_type 
WHERE item_type = 'property'::item_type;

-- Step 3: Check the updated enum values
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'item_type'
ORDER BY e.enumsortorder;

-- Step 4: Check current data after update
SELECT 
  item_type, 
  COUNT(*) as count
FROM public.bucketlist 
GROUP BY item_type;

-- Step 5: Test inserting with new enum values
BEGIN;
  -- Test insert with new enum values
  INSERT INTO public.bucketlist (user_id, item_type, item_id) 
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'experiences'::item_type, '00000000-0000-0000-0000-000000000001'::uuid);
  
  INSERT INTO public.bucketlist (user_id, item_type, item_id) 
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'stays'::item_type, '00000000-0000-0000-0000-000000000002'::uuid);
  
  SELECT 'Insert test successful' as result;
ROLLBACK;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bucketlist enum updated successfully!';
  RAISE NOTICE '🔄 Added new enum values: experiences, stays';
  RAISE NOTICE '📊 Updated existing records to new enum values';
  RAISE NOTICE '✅ Test inserts completed successfully';
  RAISE NOTICE '🎯 Bucketlist is now ready for the new enum values!';
END $$;
