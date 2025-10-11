-- =====================================================
-- EJA Homestay - Add Enum Values Only
-- =====================================================
-- This script ONLY adds the new enum values
-- Run this first, then run the update script separately
-- =====================================================

-- Step 1: Add new enum values to the existing enum type
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'experiences';
ALTER TYPE public.item_type ADD VALUE IF NOT EXISTS 'stays';

-- Step 2: Check the updated enum values
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname = 'item_type'
ORDER BY e.enumsortorder;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Enum values added successfully!';
  RAISE NOTICE '🔄 Added: experiences, stays';
  RAISE NOTICE '📊 Check the results above to verify enum values';
  RAISE NOTICE '🎯 Now run the update script to migrate existing data';
END $$;
