-- =====================================================
-- RLS SETUP FOR UNIFIED SEARCH VIEW
-- =====================================================
-- Setup Row Level Security for the unified search view
-- Since it's a virtual table, we enable RLS on underlying tables
-- and set security_invoker = true on the view

-- =====================================================
-- STEP 1: ENABLE RLS ON UNDERLYING TABLES
-- =====================================================

-- Enable RLS on the underlying tables that the unified view references
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: SET SECURITY INVOKER ON THE VIEW
-- =====================================================

-- Set security invoker on the unified search view
-- This means the view will inherit security from the underlying tables
ALTER VIEW public.unified_search_view SET (security_invoker = true);

-- =====================================================
-- STEP 3: DROP EXISTING POLICIES (IF ANY)
-- =====================================================

-- Drop existing policies for properties table
DROP POLICY IF EXISTS "Allow authenticated users to view properties" ON public.properties;
DROP POLICY IF EXISTS "Allow service role to manage properties" ON public.properties;
DROP POLICY IF EXISTS "Allow anonymous users to view available properties" ON public.properties;

-- Drop existing policies for experiences table
DROP POLICY IF EXISTS "Allow authenticated users to view experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow service role to manage experiences" ON public.experiences;
DROP POLICY IF EXISTS "Allow anonymous users to view active experiences" ON public.experiences;

-- Drop existing policies for retreats table
DROP POLICY IF EXISTS "Allow authenticated users to view retreats" ON public.retreats;
DROP POLICY IF EXISTS "Allow service role to manage retreats" ON public.retreats;
DROP POLICY IF EXISTS "Allow anonymous users to view active retreats" ON public.retreats;

-- =====================================================
-- STEP 4: CREATE RLS POLICIES FOR UNDERLYING TABLES
-- =====================================================

-- =====================================================
-- PROPERTIES TABLE POLICIES
-- =====================================================

-- Allow authenticated users to view properties
CREATE POLICY "Allow authenticated users to view properties" ON public.properties
    FOR SELECT
    TO authenticated
    USING (is_available = true);

-- Allow service role to manage properties
CREATE POLICY "Allow service role to manage properties" ON public.properties
    FOR ALL
    TO service_role
    USING (true);

-- Allow anonymous users to view available properties (for public search)
CREATE POLICY "Allow anonymous users to view available properties" ON public.properties
    FOR SELECT
    TO anon
    USING (is_available = true);

-- =====================================================
-- EXPERIENCES TABLE POLICIES
-- =====================================================

-- Allow authenticated users to view experiences
CREATE POLICY "Allow authenticated users to view experiences" ON public.experiences
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Allow service role to manage experiences
CREATE POLICY "Allow service role to manage experiences" ON public.experiences
    FOR ALL
    TO service_role
    USING (true);

-- Allow anonymous users to view active experiences (for public search)
CREATE POLICY "Allow anonymous users to view active experiences" ON public.experiences
    FOR SELECT
    TO anon
    USING (is_active = true);

-- =====================================================
-- RETREATS TABLE POLICIES
-- =====================================================

-- Allow authenticated users to view retreats
CREATE POLICY "Allow authenticated users to view retreats" ON public.retreats
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Allow service role to manage retreats
CREATE POLICY "Allow service role to manage retreats" ON public.retreats
    FOR ALL
    TO service_role
    USING (true);

-- Allow anonymous users to view active retreats (for public search)
CREATE POLICY "Allow anonymous users to view active retreats" ON public.retreats
    FOR SELECT
    TO anon
    USING (is_active = true);

-- =====================================================
-- STEP 5: GRANT PERMISSIONS ON SEARCH FUNCTION
-- =====================================================

-- Grant execute permission on the search function to authenticated users
GRANT EXECUTE ON FUNCTION public.search_all_cards(TEXT, TEXT[], NUMERIC, NUMERIC, TEXT[], TEXT[], INTEGER, INTEGER) TO authenticated;

-- Grant execute permission on the search function to anonymous users (for public search)
GRANT EXECUTE ON FUNCTION public.search_all_cards(TEXT, TEXT[], NUMERIC, NUMERIC, TEXT[], TEXT[], INTEGER, INTEGER) TO anon;

-- Grant execute permission on the search function to service role
GRANT EXECUTE ON FUNCTION public.search_all_cards(TEXT, TEXT[], NUMERIC, NUMERIC, TEXT[], TEXT[], INTEGER, INTEGER) TO service_role;

-- =====================================================
-- STEP 6: GRANT SELECT ON THE VIEW
-- =====================================================

-- Grant select permission on the unified search view to authenticated users
GRANT SELECT ON public.unified_search_view TO authenticated;

-- Grant select permission on the unified search view to anonymous users (for public search)
GRANT SELECT ON public.unified_search_view TO anon;

-- Grant select permission on the unified search view to service role
GRANT SELECT ON public.unified_search_view TO service_role;

-- =====================================================
-- STEP 7: VERIFICATION QUERIES
-- =====================================================

-- Test queries to verify RLS is working correctly
-- (These are commented out - uncomment to test)

-- Test 1: Check if authenticated users can access the view
-- SELECT COUNT(*) FROM public.unified_search_view;

-- Test 2: Check if the search function works
-- SELECT * FROM public.search_all_cards('mountain', NULL, NULL, NULL, NULL, NULL, 5, 0);

-- Test 3: Check if only active/available items are returned
-- SELECT card_type, COUNT(*) FROM public.unified_search_view GROUP BY card_type;

-- =====================================================
-- RLS SETUP COMPLETE
-- =====================================================
-- ✅ RLS enabled on underlying tables (properties, experiences, retreats)
-- ✅ Security invoker set on unified_search_view
-- ✅ Existing policies dropped and recreated
-- ✅ Policies created for authenticated, anonymous, and service role users
-- ✅ Permissions granted on search function and view
-- ✅ Only active/available items are accessible
-- =====================================================

-- =====================================================
-- POLICY EXPLANATION
-- =====================================================
-- 
-- 1. **Underlying Tables**: RLS is enabled on properties, experiences, and retreats
-- 2. **View Security**: security_invoker = true means the view inherits security from underlying tables
-- 3. **User Access**:
--    - Authenticated users: Can view all active/available items
--    - Anonymous users: Can view all active/available items (for public search)
--    - Service role: Full access to all items
-- 4. **Data Filtering**: Only items with is_active=true or is_available=true are accessible
-- 5. **Function Access**: All user types can execute the search function
-- 
-- This setup ensures:
-- - Public search functionality works for all users
-- - Only active/available items are searchable
-- - Service role maintains full access for admin operations
-- - Security is maintained at the table level
-- =====================================================
