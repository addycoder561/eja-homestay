-- =====================================================
-- EJA Homestay - Update EJA Host Information
-- =====================================================
-- This script updates the EJA host information in experiences_unified table
-- and removes unnecessary columns
-- =====================================================

-- Step 1: Drop the view first to avoid dependency issues
DROP VIEW IF EXISTS public.experiences_with_host;

-- Step 2: Update EJA host information in experiences_unified table
UPDATE public.experiences_unified 
SET 
  host_name = 'EJA',
  host_avatar = 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png'
WHERE host_name = 'EJA Experiences';

-- Step 3: Drop host_bio and host_usps columns from experiences_unified table
ALTER TABLE public.experiences_unified 
DROP COLUMN IF EXISTS host_bio,
DROP COLUMN IF EXISTS host_usps;

CREATE OR REPLACE VIEW public.experiences_with_host AS
SELECT 
  id,
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
  updated_at,
  host_name,
  host_avatar
FROM public.experiences_unified
WHERE is_active = true;

-- Step 4: Grant permissions for the updated view
GRANT SELECT ON public.experiences_with_host TO authenticated;

-- Step 5: Update the default values for new experiences
ALTER TABLE public.experiences_unified 
ALTER COLUMN host_name SET DEFAULT 'EJA',
ALTER COLUMN host_avatar SET DEFAULT 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/Brand%20Logo/eja_logo.png';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ EJA host information updated successfully!';
  RAISE NOTICE '🏢 Host name changed to: EJA';
  RAISE NOTICE '🖼️ Host avatar updated to new EJA logo';
  RAISE NOTICE '🗑️ Removed columns: host_bio, host_usps';
  RAISE NOTICE '👀 View recreated: experiences_with_host';
  RAISE NOTICE '🎯 All experiences now show EJA with new logo!';
END $$;
