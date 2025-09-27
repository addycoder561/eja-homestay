-- =====================================================
-- EJA Homestay - Update Retreat Experiences References
-- =====================================================
-- This script updates retreat_experiences to reference the new unified table
-- Run this BEFORE deleting the old experiences and retreats tables
-- =====================================================

-- Step 1: Temporarily disable foreign key constraint
ALTER TABLE public.retreat_experiences 
DROP CONSTRAINT IF EXISTS retreat_experiences_retreat_id_fkey;

-- Step 2: Update retreat_experiences to reference unified table by matching titles
UPDATE public.retreat_experiences 
SET retreat_id = eu.id
FROM public.retreats r, public.experiences_unified eu
WHERE r.id = retreat_experiences.retreat_id
  AND r.title = eu.title 
  AND eu.location = 'Far-away retreats';

-- Step 3: Re-add foreign key constraint pointing to unified table
ALTER TABLE public.retreat_experiences 
ADD CONSTRAINT retreat_experiences_retreat_id_fkey 
FOREIGN KEY (retreat_id) REFERENCES public.experiences_unified(id) ON DELETE CASCADE;

-- Step 4: Verify the update worked
SELECT 
  COUNT(*) as total_retreat_experiences,
  COUNT(eu.id) as valid_references
FROM public.retreat_experiences re
LEFT JOIN public.experiences_unified eu ON re.retreat_id = eu.id;

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ Retreat Experiences References Updated!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '🔗 retreat_experiences now references experiences_unified';
  RAISE NOTICE '🔒 Foreign key constraint updated';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Verify the reference count above looks correct';
  RAISE NOTICE '2. Delete old experiences and retreats tables';
  RAISE NOTICE '3. Update your app code to use experiences_unified';
  RAISE NOTICE '=====================================================';
END $$;
