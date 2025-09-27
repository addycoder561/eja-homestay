-- =====================================================
-- EJA Homestay - Cleanup Old Experiences Tables
-- =====================================================
-- This script removes the old experiences and retreats tables
-- after successful migration to experiences_unified
-- 
-- ⚠️  WARNING: Only run this AFTER verifying the migration worked correctly
-- ⚠️  This script will permanently delete the old tables and their data
-- =====================================================

-- Step 1: Verify the unified table exists and has data
DO $$
DECLARE
  unified_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unified_count FROM public.experiences_unified;
  
  IF unified_count = 0 THEN
    RAISE EXCEPTION '❌ experiences_unified table is empty! Aborting cleanup.';
  ELSE
    RAISE NOTICE '✅ Found % records in experiences_unified table', unified_count;
  END IF;
END $$;

-- Step 2: Verify retreat_experiences table references are working
DO $$
DECLARE
  invalid_refs INTEGER;
  total_refs INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_refs
  FROM public.retreat_experiences re
  LEFT JOIN public.experiences_unified eu ON re.retreat_id = eu.id
  WHERE eu.id IS NULL;
  
  SELECT COUNT(*) INTO total_refs FROM public.retreat_experiences;
  
  IF invalid_refs > 0 THEN
    RAISE EXCEPTION '❌ Found % invalid references in retreat_experiences! Aborting cleanup.', invalid_refs;
  ELSE
    RAISE NOTICE '✅ All % retreat_experiences references are valid', total_refs;
  END IF;
END $$;

-- Step 3: Verify related tables (bookings, reviews, wishlist, shares) are working
DO $$
DECLARE
  invalid_bookings INTEGER;
  invalid_reviews INTEGER;
  invalid_wishlist INTEGER;
  invalid_shares INTEGER;
BEGIN
  -- Check bookings
  SELECT COUNT(*) INTO invalid_bookings
  FROM public.bookings b
  LEFT JOIN public.experiences_unified eu ON b.item_id = eu.id
  WHERE b.booking_type IN ('experience', 'retreat') AND eu.id IS NULL;
  
  -- Check reviews
  SELECT COUNT(*) INTO invalid_reviews
  FROM public.reviews r
  LEFT JOIN public.experiences_unified eu ON r.item_id = eu.id
  WHERE r.review_type IN ('experience', 'retreat') AND eu.id IS NULL;
  
  -- Check wishlist
  SELECT COUNT(*) INTO invalid_wishlist
  FROM public.wishlist w
  LEFT JOIN public.experiences_unified eu ON w.item_id = eu.id
  WHERE w.item_type IN ('experience', 'retreat') AND eu.id IS NULL;
  
  -- Check shares
  SELECT COUNT(*) INTO invalid_shares
  FROM public.shares s
  LEFT JOIN public.experiences_unified eu ON s.item_id = eu.id
  WHERE s.item_type IN ('experience', 'retreat') AND eu.id IS NULL;
  
  IF invalid_bookings > 0 OR invalid_reviews > 0 OR invalid_wishlist > 0 OR invalid_shares > 0 THEN
    RAISE EXCEPTION '❌ Found invalid references in related tables! Aborting cleanup.';
  ELSE
    RAISE NOTICE '✅ All related table references are valid';
  END IF;
END $$;

-- Step 4: Drop old indexes (they will be recreated automatically when we drop tables)
DROP INDEX IF EXISTS idx_experiences_host_id;
DROP INDEX IF EXISTS idx_experiences_active;
DROP INDEX IF EXISTS idx_experiences_location;
DROP INDEX IF EXISTS idx_retreats_host_id;
DROP INDEX IF EXISTS idx_retreats_active;
DROP INDEX IF EXISTS idx_retreats_location;

-- Step 5: Drop old triggers
DROP TRIGGER IF EXISTS update_experiences_updated_at ON public.experiences;
DROP TRIGGER IF EXISTS update_retreats_updated_at ON public.retreats;

-- Step 6: Drop old tables (in correct order due to foreign key constraints)
-- First drop retreat_experiences since it references retreats
DROP TABLE IF EXISTS public.retreat_experiences CASCADE;

-- Then drop the main tables
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.retreats CASCADE;

-- Step 7: Rename the unified table to the standard name
ALTER TABLE public.experiences_unified RENAME TO experiences;

-- Step 8: Update the retreat_experiences table to reference the renamed experiences table
-- We need to recreate this table since we dropped it
CREATE TABLE IF NOT EXISTS public.retreat_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  experience_type TEXT NOT NULL, -- 'tight budget', 'family comfort', 'premium'
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Recreate indexes for retreat_experiences
CREATE INDEX IF NOT EXISTS idx_retreat_experiences_retreat_id ON public.retreat_experiences(retreat_id);
CREATE INDEX IF NOT EXISTS idx_retreat_experiences_type ON public.retreat_experiences(experience_type);
CREATE INDEX IF NOT EXISTS idx_retreat_experiences_active ON public.retreat_experiences(is_active);

-- Step 10: Re-enable RLS for retreat_experiences
ALTER TABLE public.retreat_experiences ENABLE ROW LEVEL SECURITY;

-- Step 11: Recreate RLS policies for retreat_experiences
CREATE POLICY "Anyone can view active retreat experiences" ON public.retreat_experiences
  FOR SELECT USING (is_active = true);

CREATE POLICY "Retreat hosts can manage their experiences" ON public.retreat_experiences
  FOR ALL USING (
    retreat_id IN (
      SELECT id FROM public.experiences WHERE auth.uid()::text = host_id::text
    )
  );

-- Step 12: Recreate trigger for retreat_experiences
CREATE TRIGGER update_retreat_experiences_updated_at
  BEFORE UPDATE ON public.retreat_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 13: Final verification
DO $$
DECLARE
  experiences_count INTEGER;
  retreat_exp_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO experiences_count FROM public.experiences;
  SELECT COUNT(*) INTO retreat_exp_count FROM public.retreat_experiences;
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ Cleanup Completed Successfully!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '📊 Unified experiences table: % records', experiences_count;
  RAISE NOTICE '📊 Retreat experiences table: % records', retreat_exp_count;
  RAISE NOTICE '🗑️  Old experiences and retreats tables removed';
  RAISE NOTICE '🔄 retreat_experiences table recreated and linked';
  RAISE NOTICE '🔒 RLS policies and triggers restored';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Your app can now use the unified experiences table!';
  RAISE NOTICE '=====================================================';
END $$;
