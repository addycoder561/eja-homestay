-- Check wishlist table contents
-- Replace 'YOUR_USER_ID' with your actual user ID

-- Show all wishlist entries
SELECT 
    id,
    user_id,
    item_id,
    item_type,
    created_at
FROM wishlist 
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your user ID
ORDER BY created_at DESC;

-- Count by item type
SELECT 
    item_type,
    COUNT(*) as count
FROM wishlist 
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your user ID
GROUP BY item_type;

-- Check for potential duplicates (same user, item_id, and item_type)
SELECT 
    user_id,
    item_id,
    item_type,
    COUNT(*) as duplicate_count
FROM wishlist 
WHERE user_id = 'YOUR_USER_ID'  -- Replace with your user ID
GROUP BY user_id, item_id, item_type
HAVING COUNT(*) > 1;

-- Total count
SELECT COUNT(*) as total_wishlist_items
FROM wishlist 
WHERE user_id = 'YOUR_USER_ID';  -- Replace with your user ID
