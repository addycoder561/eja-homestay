-- Clean up duplicate wishlist entries for specific user
-- Replace with your actual user ID: 985c70b3-0d69-4690-8f9a-4d800184839c

-- First, let's see what duplicates exist for your user
WITH duplicates AS (
  SELECT 
    user_id,
    item_id,
    item_type,
    COUNT(*) as duplicate_count,
    MAX(created_at) as latest_created_at
  FROM wishlist 
  WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
  GROUP BY user_id, item_id, item_type
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicates;

-- Show all entries for your user before cleanup
SELECT 
    id,
    user_id,
    item_id,
    item_type,
    created_at
FROM wishlist 
WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
ORDER BY created_at DESC;

-- Remove duplicate entries, keeping only the most recent one
DELETE FROM wishlist 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, item_id, item_type 
        ORDER BY created_at DESC
      ) as rn
    FROM wishlist
    WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
  ) ranked
  WHERE rn > 1
);

-- Verify the cleanup - show remaining entries
SELECT 
    id,
    user_id,
    item_id,
    item_type,
    created_at
FROM wishlist 
WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
ORDER BY created_at DESC;

-- Count by item type after cleanup
SELECT 
    item_type,
    COUNT(*) as count
FROM wishlist 
WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
GROUP BY item_type
ORDER BY item_type;
