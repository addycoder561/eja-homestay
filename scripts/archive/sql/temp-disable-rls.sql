-- Temporarily disable RLS for experiences table to allow bulk upload
-- Run this before uploading experiences, then re-enable after

-- Disable RLS on experiences table
ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;

-- Note: After upload is complete, run the following to re-enable RLS:
-- ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
