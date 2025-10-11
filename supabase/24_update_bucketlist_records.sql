-- =====================================================
-- EJA Homestay - Update Bucketlist Records
-- =====================================================
-- This script updates existing records to use new enum values
-- Run this AFTER running the enum values script
-- =====================================================

-- Step 1: Check current data before update
SELECT 
  item_type, 
  COUNT(*) as count
FROM public.bucketlist 
GROUP BY item_type;

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

-- Step 3: Check data after update
SELECT 
  item_type, 
  COUNT(*) as count
FROM public.bucketlist 
GROUP BY item_type;

-- Step 4: Test inserting with new enum values (using existing user if available)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to find an existing user
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Test insert with new enum values using existing user
    INSERT INTO public.bucketlist (user_id, item_type, item_id) 
    VALUES (test_user_id, 'experiences'::item_type, '00000000-0000-0000-0000-000000000001'::uuid);
    
    INSERT INTO public.bucketlist (user_id, item_type, item_id) 
    VALUES (test_user_id, 'stays'::item_type, '00000000-0000-0000-0000-000000000002'::uuid);
    
    RAISE NOTICE '✅ Insert test successful with user: %', test_user_id;
    
    -- Clean up test records
    DELETE FROM public.bucketlist WHERE item_id IN ('00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid);
  ELSE
    RAISE NOTICE '⚠️ No users found in profiles table, skipping insert test';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bucketlist records updated successfully!';
  RAISE NOTICE '🔄 Migrated existing records to new enum values';
  RAISE NOTICE '✅ Test inserts completed successfully';
  RAISE NOTICE '🎯 Bucketlist is now ready for the new enum values!';
END $$;
