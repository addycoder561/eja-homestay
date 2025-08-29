-- Migration: Remove collaborations table and related functionality
-- This migration removes the collaborations table and all associated triggers and policies

-- Drop the collaborations table and all its dependencies
DROP TABLE IF EXISTS public.collaborations CASCADE;

-- Note: The update_updated_at_column() function is kept as it might be used by other tables
-- If you want to remove it completely, you can run:
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
