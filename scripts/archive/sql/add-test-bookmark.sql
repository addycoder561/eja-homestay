-- Add a test bookmark to verify functionality
-- Replace the user_id and item_id with actual values from your database

-- First, let's see what users and properties we have
SELECT id, email, full_name FROM profiles LIMIT 5;
SELECT id, title FROM properties LIMIT 5;

-- Then add a test bookmark (uncomment and modify the values below)
-- INSERT INTO bookmarks (user_id, item_id, item_type) 
-- VALUES (
--   'your-user-id-here',  -- Replace with actual user ID
--   'your-property-id-here',  -- Replace with actual property ID
--   'property'
-- );

-- Check if the bookmark was added
-- SELECT * FROM bookmarks WHERE user_id = 'your-user-id-here'; 