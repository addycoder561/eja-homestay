-- Debug script to check bucketlist data
-- This will help us see what's actually in the bucketlist table

-- Check all bucketlist records
SELECT 
  id,
  user_id,
  item_type,
  item_id,
  created_at
FROM bucketlist 
ORDER BY created_at DESC;

-- Check item_type breakdown
SELECT 
  item_type,
  COUNT(*) as count
FROM bucketlist 
GROUP BY item_type
ORDER BY count DESC;

-- Check recent records (last 10)
SELECT 
  id,
  user_id,
  item_type,
  item_id,
  created_at
FROM bucketlist 
ORDER BY created_at DESC 
LIMIT 10;
