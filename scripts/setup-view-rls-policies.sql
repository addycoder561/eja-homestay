-- =====================================================
-- RLS POLICIES FOR OPTIMIZED VIEWS
-- =====================================================
-- Enable Row Level Security and set up policies for the booking system views
-- Run this script in Supabase SQL Editor

-- =====================================================
-- STEP 1: ENABLE RLS ON UNDERLYING TABLES
-- =====================================================

-- Enable RLS on the underlying tables that the views reference
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Set security invoker on views (this is the correct way for views)
ALTER VIEW public.room_availability_view SET (security_invoker = true);
ALTER VIEW public.property_rooms_summary SET (security_invoker = true);
ALTER VIEW public.room_calendar_view SET (security_invoker = true);

-- =====================================================
-- STEP 2: CREATE RLS POLICIES FOR UNDERLYING TABLES
-- =====================================================

-- Policies for rooms table
CREATE POLICY "Allow authenticated users to view rooms" ON public.rooms
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow service role to manage rooms" ON public.rooms
    FOR ALL
    TO service_role
    USING (true);

-- Policies for room_inventory table
CREATE POLICY "Allow authenticated users to view room inventory" ON public.room_inventory
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow service role to manage room inventory" ON public.room_inventory
    FOR ALL
    TO service_role
    USING (true);

-- Policies for properties table
CREATE POLICY "Allow authenticated users to view properties" ON public.properties
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow service role to manage properties" ON public.properties
    FOR ALL
    TO service_role
    USING (true);

-- =====================================================
-- STEP 3: ADD PROPERTY-SPECIFIC POLICIES (OPTIONAL)
-- =====================================================

-- Optional: If you want to restrict users to only see properties they have access to
-- Uncomment and modify these policies based on your access control requirements

-- Policy: Allow users to view only properties they have access to
-- CREATE POLICY "Users can view only accessible properties" ON public.properties
--     FOR SELECT
--     TO authenticated
--     USING (
--         id IN (
--             SELECT property_id 
--             FROM user_property_access 
--             WHERE user_id = auth.uid()
--         )
--     );

-- Policy: Allow users to view only accessible rooms
-- CREATE POLICY "Users can view only accessible rooms" ON public.rooms
--     FOR SELECT
--     TO authenticated
--     USING (
--         property_id IN (
--             SELECT property_id 
--             FROM user_property_access 
--             WHERE user_id = auth.uid()
--         )
--     );

-- =====================================================
-- STEP 4: VERIFY POLICIES
-- =====================================================

-- Check if policies were created successfully
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('rooms', 'room_inventory', 'properties')
-- ORDER BY tablename, policyname;

-- =====================================================
-- RLS SETUP COMPLETED
-- =====================================================
-- ✅ RLS enabled on underlying tables (rooms, room_inventory, properties)
-- ✅ Security invoker set on views for proper access control
-- ✅ Basic read policies for authenticated users
-- ✅ Service role policies for admin functions
-- ✅ Optional property-specific policies (commented out)
-- 
-- NOTE: The views inherit security from their underlying tables
-- Users must be authenticated to access the data
-- Service role can access for admin/backend functions
-- =====================================================
