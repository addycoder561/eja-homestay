-- Fix materialized view issue
-- Drop the problematic materialized view and related functions
DROP MATERIALIZED VIEW IF EXISTS public.property_stats CASCADE;
DROP FUNCTION IF EXISTS public.refresh_property_stats() CASCADE;
DROP FUNCTION IF EXISTS public.update_property_stats() CASCADE;
