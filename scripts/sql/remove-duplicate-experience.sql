-- Remove duplicate experience entry
-- This will remove the older experience entry and keep the newer one

-- First, let's see the two experience entries
SELECT 
    id,
    item_id,
    item_type,
    created_at
FROM wishlist 
WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
  AND item_type = 'experience'
ORDER BY created_at DESC;

-- Remove the older experience entry (keep the newer one from 2025-08-10)
DELETE FROM wishlist 
WHERE id = 'ff481ce2-8b78-49d2-b372-188017aabab4';  -- This is the older entry from 2025-08-01

-- Verify the result
SELECT 
    id,
    item_id,
    item_type,
    created_at
FROM wishlist 
WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c'
ORDER BY created_at DESC;

-- Final count
SELECT COUNT(*) as total_wishlist_items
FROM wishlist 
WHERE user_id = '985c70b3-0d69-4690-8f9a-4d800184839c';
