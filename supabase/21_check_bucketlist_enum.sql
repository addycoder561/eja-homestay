-- =====================================================
-- EJA Homestay - Check Bucketlist Enum Values
-- =====================================================
-- This script checks the current enum values for item_type
-- =====================================================

-- Check the current enum type and its values
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%item_type%' OR t.typname LIKE '%bucketlist%'
ORDER BY t.typname, e.enumsortorder;

-- Check the bucketlist table structure
SELECT 
  column_name, 
  data_type, 
  udt_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bucketlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing records
SELECT 
  item_type, 
  COUNT(*) as count
FROM public.bucketlist 
GROUP BY item_type;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bucketlist enum check completed!';
  RAISE NOTICE '📊 Check the results above to see current enum values';
  RAISE NOTICE '🎯 We need to update the enum to include new values';
END $$;
