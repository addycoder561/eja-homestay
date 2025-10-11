-- =====================================================
-- EJA Homestay - Test Bucketlist Functionality
-- =====================================================
-- This script tests the bucketlist functionality to ensure it works correctly
-- =====================================================

-- Test 1: Check if bucketlist table exists and has correct structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bucketlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 2: Check current item types in the table
SELECT 
  item_type, 
  COUNT(*) as count
FROM public.bucketlist 
GROUP BY item_type;

-- Test 3: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'bucketlist';

-- Test 4: Test inserting a sample record (this will be rolled back)
BEGIN;
  INSERT INTO public.bucketlist (user_id, item_type, item_id) 
  VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'experiences', '00000000-0000-0000-0000-000000000001'::uuid);
  
  SELECT 'Insert test successful' as result;
ROLLBACK;

-- Test 5: Check constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.bucketlist'::regclass;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bucketlist functionality test completed!';
  RAISE NOTICE '📊 Check the results above to verify everything is working';
  RAISE NOTICE '🎯 If all tests pass, the bucketlist should work correctly';
END $$;
