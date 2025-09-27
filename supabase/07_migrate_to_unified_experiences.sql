-- =====================================================
-- EJA Homestay - Unified Experiences Migration
-- =====================================================
-- This script combines experiences and retreats tables into a single unified table
-- 
-- IMPORTANT: Run this script in Supabase SQL Editor
-- BACKUP YOUR DATA BEFORE RUNNING THIS SCRIPT
-- =====================================================

-- Step 0: Clean up any existing unified table from previous attempts
DROP TABLE IF EXISTS public.experiences_unified CASCADE;

-- Step 1: Create the unified experiences table
CREATE TABLE IF NOT EXISTS public.experiences_unified (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  mood TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_hours INTEGER, -- NULL for retreats, filled for experiences
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Migrate existing experiences data
INSERT INTO public.experiences_unified (
  id,
  host_id,
  title,
  description,
  location,
  mood,
  price,
  duration_hours,
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at
)
SELECT 
  id,
  host_id::UUID, -- Explicitly cast to UUID
  title,
  description,
  CASE 
    -- Map location values
    WHEN location = 'Delhi-NCR' THEN 'Hyper-local'
    WHEN location = 'India' THEN 'Online'
    ELSE location -- Keep any other values as-is
  END as location,
  CASE 
    -- Map existing mood values to new mood system
    WHEN mood = 'Foodie' THEN 'Foodie'
    WHEN mood = 'Adventure' THEN 'Thrill'
    WHEN mood = 'Creative' THEN 'Artistic'
    WHEN mood = 'Meaningful' THEN 'Soulful'
    WHEN mood = 'Playful' THEN 'Chill'
    ELSE mood -- Keep any other values as-is
  END as mood,
  price,
  duration_hours, -- Keep existing duration_hours for experiences
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at
FROM public.experiences;

-- Step 3: Migrate existing retreats data
INSERT INTO public.experiences_unified (
  id,
  host_id,
  title,
  description,
  location,
  mood,
  price,
  duration_hours,
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id, -- Generate new UUID to avoid conflicts
  host_id::UUID, -- Explicitly cast to UUID
  title,
  description,
  CASE 
    -- Map location values
    WHEN location = 'Mountains' THEN 'Far-away retreats'
    ELSE location -- Keep any other values as-is
  END as location,
  categories[1] as mood, -- Move first category to mood column for retreats
  price,
  NULL as duration_hours, -- Retreats don't have duration_hours
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at
FROM public.retreats;

-- Step 3.5: Update specific online experiences with correct moods
UPDATE public.experiences_unified 
SET mood = 'Soulful'
WHERE title = 'Bonding Friends' AND location = 'Online';

UPDATE public.experiences_unified 
SET mood = 'Chill'
WHERE title = 'Community Circle' AND location = 'Online';

UPDATE public.experiences_unified 
SET mood = 'Chill'
WHERE title = 'Speed Friending' AND location = 'Online';

-- Step 4: Update retreat_experiences table to reference the new unified table
-- First, temporarily disable the foreign key constraint
ALTER TABLE public.retreat_experiences 
DROP CONSTRAINT IF EXISTS retreat_experiences_retreat_id_fkey;

-- Update retreat_experiences table to use the new unified table IDs by matching retreat titles
UPDATE public.retreat_experiences 
SET retreat_id = eu.id
FROM public.retreats r
JOIN public.experiences_unified eu ON (
  r.id = retreat_experiences.retreat_id
  AND r.title = eu.title 
  AND eu.location = 'Far-away retreats'
);

-- Step 5: Add new foreign key constraint pointing to experiences_unified
ALTER TABLE public.retreat_experiences 
ADD CONSTRAINT retreat_experiences_retreat_id_fkey 
FOREIGN KEY (retreat_id) REFERENCES public.experiences_unified(id) ON DELETE CASCADE;

-- Step 6: Update indexes for the new unified table
CREATE INDEX IF NOT EXISTS idx_experiences_unified_host_id ON public.experiences_unified(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_active ON public.experiences_unified(is_active);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_location ON public.experiences_unified(location);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_type ON public.experiences_unified(experience_type);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_duration ON public.experiences_unified(duration_hours);

-- Step 7: Update RLS policies for the new unified table
ALTER TABLE public.experiences_unified ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for experiences and retreats
DROP POLICY IF EXISTS "Anyone can view active experiences" ON public.experiences;
DROP POLICY IF EXISTS "Hosts can manage their experiences" ON public.experiences;
DROP POLICY IF EXISTS "Anyone can view active retreats" ON public.retreats;
DROP POLICY IF EXISTS "Hosts can manage their retreats" ON public.retreats;

-- Create new policies for unified experiences table
CREATE POLICY "Anyone can view active unified experiences" ON public.experiences_unified
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their unified experiences" ON public.experiences_unified
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Step 8: Update triggers for the new unified table
CREATE TRIGGER update_experiences_unified_updated_at
  BEFORE UPDATE ON public.experiences_unified
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 9: Update bookings table to reference unified experiences
-- Update existing bookings that reference experiences or retreats
UPDATE public.bookings 
SET item_id = (
  SELECT eu.id 
  FROM public.experiences_unified eu 
  WHERE eu.id = bookings.item_id 
  AND bookings.booking_type IN ('experience', 'retreat')
)
WHERE booking_type IN ('experience', 'retreat');

-- Step 10: Update reviews table to reference unified experiences
UPDATE public.reviews 
SET item_id = (
  SELECT eu.id 
  FROM public.experiences_unified eu 
  WHERE eu.id = reviews.item_id 
  AND reviews.review_type IN ('experience', 'retreat')
)
WHERE review_type IN ('experience', 'retreat');

-- Step 11: Update wishlist table to reference unified experiences
UPDATE public.wishlist 
SET item_id = (
  SELECT eu.id 
  FROM public.experiences_unified eu 
  WHERE eu.id = wishlist.item_id 
  AND wishlist.item_type IN ('experience', 'retreat')
)
WHERE item_type IN ('experience', 'retreat');

-- Step 12: Update shares table to reference unified experiences
UPDATE public.shares 
SET item_id = (
  SELECT eu.id 
  FROM public.experiences_unified eu 
  WHERE eu.id = shares.item_id 
  AND shares.item_type IN ('experience', 'retreat')
)
WHERE item_type IN ('experience', 'retreat');

-- Step 13: Verify data integrity
-- Check that all experiences were migrated
DO $$
DECLARE
  exp_count INTEGER;
  retreat_count INTEGER;
  unified_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exp_count FROM public.experiences;
  SELECT COUNT(*) INTO retreat_count FROM public.retreats;
  SELECT COUNT(*) INTO unified_count FROM public.experiences_unified;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE 'Experiences migrated: %', exp_count;
  RAISE NOTICE 'Retreats migrated: %', retreat_count;
  RAISE NOTICE 'Total in unified table: %', unified_count;
  
  IF unified_count = (exp_count + retreat_count) THEN
    RAISE NOTICE '✅ Data migration successful - all records migrated';
  ELSE
    RAISE NOTICE '❌ Data migration issue - count mismatch';
  END IF;
END $$;

-- Step 14: Show sample of migrated data
SELECT 
  id,
  title,
  location,
  mood,
  duration_hours,
  price
FROM public.experiences_unified 
ORDER BY location, title
LIMIT 15;

-- Step 15: Verification queries
-- Check hyperlocal experiences (should have duration_hours)
SELECT 
  COUNT(*) as hyperlocal_count,
  COUNT(duration_hours) as with_duration_count
FROM public.experiences_unified 
WHERE location = 'Hyper-local';

-- Check far-away retreats (should have NULL duration_hours)
SELECT 
  COUNT(*) as retreat_count,
  COUNT(duration_hours) as with_duration_count
FROM public.experiences_unified 
WHERE location = 'Far-away retreats';

-- Check online experiences
SELECT 
  COUNT(*) as online_count,
  COUNT(duration_hours) as with_duration_count
FROM public.experiences_unified 
WHERE location = 'Online';

-- Check retreat_experiences references
SELECT 
  COUNT(*) as retreat_exp_count,
  COUNT(eu.id) as valid_references
FROM public.retreat_experiences re
LEFT JOIN public.experiences_unified eu ON re.retreat_id = eu.id;

-- Check mood distribution by location
SELECT 
  location,
  mood,
  COUNT(*) as count
FROM public.experiences_unified 
GROUP BY location, mood
ORDER BY location, mood;

-- COMPLETION MESSAGE
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ Unified Experiences Migration Completed!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '📊 Created experiences_unified table with all data';
  RAISE NOTICE '🔄 Updated retreat_experiences references';
  RAISE NOTICE '🔒 RLS policies updated';
  RAISE NOTICE '📈 Indexes created for performance';
  RAISE NOTICE '🎯 Ready for app code updates';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT STEPS:';
  RAISE NOTICE '1. Verify the data looks correct above';
  RAISE NOTICE '2. Update your app code to use experiences_unified table';
  RAISE NOTICE '3. Test thoroughly before dropping old tables';
  RAISE NOTICE '4. Once confirmed, run the cleanup script to drop old tables';
  RAISE NOTICE '=====================================================';
END $$;
