-- Check the structure of experiences_unified table
-- This will help us identify the correct column names

-- Get table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'experiences_unified' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what data exists in the table
SELECT id, title, location 
FROM public.experiences_unified 
LIMIT 5;

-- Check if there are any retreats by looking at the data
SELECT DISTINCT title 
FROM public.experiences_unified 
WHERE title ILIKE '%retreat%' 
OR title ILIKE '%getaway%'
ORDER BY title;
