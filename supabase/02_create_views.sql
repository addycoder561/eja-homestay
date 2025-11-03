-- =====================================================
-- EJA HOMESTAY - Database Views
-- =====================================================
-- This script creates all 6 views for optimized queries
-- and aggregated statistics.
--
-- Run this script AFTER schema creation and data insertion.
-- Run in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. COMPLETED_DARE_STATS VIEW
-- =====================================================
CREATE OR REPLACE VIEW completed_dare_stats AS
SELECT 
  cd.id AS completed_dare_id,
  cd.dare_id,
  COUNT(CASE WHEN de.engagement_type = 'smile' THEN 1 END) AS smile_count,
  COUNT(CASE WHEN de.engagement_type = 'comment' THEN 1 END) AS comment_count,
  COUNT(CASE WHEN de.engagement_type = 'share' THEN 1 END) AS share_count,
  COUNT(CASE WHEN de.engagement_type = 'tag' THEN 1 END) AS tag_count,
  COUNT(*) AS total_engagements
FROM completed_dares cd
LEFT JOIN dare_engagements de ON de.completed_dare_id = cd.id
WHERE cd.is_active = true
GROUP BY cd.id, cd.dare_id;

-- =====================================================
-- 2. DARE_STATS VIEW
-- =====================================================
CREATE OR REPLACE VIEW dare_stats AS
SELECT 
  d.id AS dare_id,
  COUNT(DISTINCT cd.id) AS completion_count,
  COUNT(CASE WHEN de.engagement_type = 'smile' THEN 1 END) AS smile_count,
  COUNT(CASE WHEN de.engagement_type = 'comment' THEN 1 END) AS comment_count,
  COUNT(CASE WHEN de.engagement_type = 'share' THEN 1 END) AS share_count,
  COUNT(*) AS total_engagements
FROM dares d
LEFT JOIN completed_dares cd ON cd.dare_id = d.id AND cd.is_active = true
LEFT JOIN dare_engagements de ON de.dare_id = d.id
WHERE d.is_active = true
GROUP BY d.id;

-- =====================================================
-- 3. EXPERIENCES_WITH_HOST VIEW
-- =====================================================
CREATE OR REPLACE VIEW experiences_with_host AS
SELECT 
  e.id,
  e.host_id,
  e.title,
  e.description,
  e.location,
  e.categories,
  e.mood,
  e.price,
  e.duration_hours,
  e.cover_image,
  e.gallery,
  e.is_active,
  e.host_name,
  e.host_avatar,
  e.host_bio AS experience_host_bio,
  e.host_usps AS experience_host_usps,
  e.unique_propositions,
  e.created_at,
  e.updated_at,
  p.full_name AS host_full_name,
  p.avatar_url AS host_avatar_url,
  p.bio AS profile_bio,
  p.host_usps AS profile_host_usps
FROM experiences e
LEFT JOIN profiles p ON p.id = e.host_id
WHERE e.is_active = true;

-- =====================================================
-- 4. PROPERTY_ROOMS_SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW property_rooms_summary AS
SELECT 
  p.id AS property_id,
  p.title AS property_title,
  COUNT(DISTINCT r.id) AS total_rooms,
  MIN(r.price) AS min_room_price,
  MAX(r.price) AS max_room_price,
  AVG(r.price) AS avg_room_price,
  SUM(r.total_inventory) AS total_room_capacity,
  SUM(r.max_guests) AS total_max_guests
FROM properties p
LEFT JOIN rooms r ON r.property_id = p.id
WHERE p.is_available = true
GROUP BY p.id, p.title;

-- =====================================================
-- 5. ROOM_AVAILABILITY_VIEW
-- =====================================================
CREATE OR REPLACE VIEW room_availability_view AS
SELECT 
  ri.id AS inventory_id,
  ri.room_id,
  ri.date,
  ri.available,
  r.property_id,
  r.name AS room_name,
  r.room_type,
  r.price,
  r.total_inventory,
  r.amenities,
  r.max_guests,
  p.title AS property_name,
  p.address AS property_location,
  CASE 
    WHEN ri.available > 0 THEN 'available'
    WHEN ri.available = 0 THEN 'booked'
    ELSE 'unavailable'
  END AS availability_status
FROM room_inventory ri
JOIN rooms r ON r.id = ri.room_id
JOIN properties p ON p.id = r.property_id
WHERE p.is_available = true;

-- =====================================================
-- 6. USER_SOCIAL_STATS VIEW
-- =====================================================
CREATE OR REPLACE VIEW user_social_stats AS
SELECT 
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  -- Follow stats
  COUNT(DISTINCT CASE WHEN f1.follower_id = p.id THEN f1.following_id END) AS following_count,
  COUNT(DISTINCT CASE WHEN f2.following_id = p.id THEN f2.follower_id END) AS followers_count,
  -- Engagement stats
  COUNT(DISTINCT CASE WHEN de.engagement_type = 'smile' THEN de.id END) AS total_smiles_given,
  COUNT(DISTINCT CASE WHEN cd.completer_id = p.id THEN cd.id END) AS completed_dares_count,
  COUNT(DISTINCT CASE WHEN d.creator_id = p.id THEN d.id END) AS dares_created_count
FROM profiles p
LEFT JOIN follows f1 ON f1.follower_id = p.id
LEFT JOIN follows f2 ON f2.following_id = p.id
LEFT JOIN dare_engagements de ON de.user_id = p.id AND de.engagement_type = 'smile'
LEFT JOIN completed_dares cd ON cd.completer_id = p.id AND cd.is_active = true
LEFT JOIN dares d ON d.creator_id = p.id AND d.is_active = true
GROUP BY p.id, p.full_name, p.avatar_url;

-- =====================================================
-- GRANT PERMISSIONS FOR VIEWS
-- =====================================================

-- Grant select permissions to authenticated users
GRANT SELECT ON completed_dare_stats TO authenticated;
GRANT SELECT ON dare_stats TO authenticated;
GRANT SELECT ON experiences_with_host TO authenticated;
GRANT SELECT ON property_rooms_summary TO authenticated;
GRANT SELECT ON room_availability_view TO authenticated;
GRANT SELECT ON user_social_stats TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
  AND table_name IN (
    'completed_dare_stats', 'dare_stats', 'experiences_with_host',
    'property_rooms_summary', 'room_availability_view', 'user_social_stats'
  );
  
  IF view_count = 6 THEN
    RAISE NOTICE '✓ Successfully created all 6 views';
  ELSE
    RAISE WARNING '✗ Expected 6 views, found %', view_count;
  END IF;
END $$;

