-- =====================================================
-- EJA Homestay - Export Unified Experiences to CSV
-- =====================================================
-- This script exports the combined experiences and retreats data
-- in the correct format for CSV upload to experiences_unified table
-- =====================================================

-- Export experiences data with proper mapping
SELECT 
  id,
  host_id,
  title,
  description,
  CASE 
    WHEN location = 'Delhi-NCR' THEN 'Hyper-local'
    WHEN location = 'India' THEN 'Online'
    ELSE location
  END as location,
  CASE 
    WHEN mood = 'Foodie' THEN 'Foodie'
    WHEN mood = 'Adventure' THEN 'Thrill'
    WHEN mood = 'Creative' THEN 'Artistic'
    WHEN mood = 'Meaningful' THEN 'Soulful'
    WHEN mood = 'Playful' THEN 'Chill'
    ELSE mood
  END as mood,
  price,
  duration_hours,
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at
FROM public.experiences

UNION ALL

-- Export retreats data with proper mapping
SELECT 
  gen_random_uuid() as id,
  host_id,
  title,
  description,
  'Far-away retreats' as location,
  categories[1] as mood,
  price,
  NULL as duration_hours,
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at
FROM public.retreats

ORDER BY location, title;
