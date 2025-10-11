-- Remove specific retreats from experiences_unified table
-- This script removes the following retreats:
-- - Specially-Abled Getaways
-- - Engineers Retreat  
-- - Patch-Up Retreat
-- - Doctors Retreat

-- First, let's check what retreats exist with these names
SELECT id, title, location 
FROM public.experiences_unified 
WHERE title IN (
    'Specially-Abled Getaways',
    'Engineers Retreat', 
    'Patch-Up Retreat',
    'Doctors Retreat'
);

-- Delete the retreats
DELETE FROM public.experiences_unified 
WHERE title IN (
    'Specially-Abled Getaways',
    'Engineers Retreat', 
    'Patch-Up Retreat',
    'Doctors Retreat'
);

-- Verify the deletion by checking if any of these titles still exist
SELECT COUNT(*) as deleted_count 
FROM public.experiences_unified 
WHERE title IN (
    'Specially-Abled Getaways',
    'Engineers Retreat', 
    'Patch-Up Retreat',
    'Doctors Retreat'
);

-- Show total count of remaining experiences
SELECT COUNT(*) as total_experiences 
FROM public.experiences_unified;
