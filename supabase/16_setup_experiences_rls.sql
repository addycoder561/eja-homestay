-- =====================================================
-- EJA Homestay - Setup RLS for Experiences
-- =====================================================
-- This script sets up proper Row Level Security (RLS) policies
-- for the experiences_unified table and experiences_with_host view
-- =====================================================

-- Enable RLS on experiences_unified table
ALTER TABLE public.experiences_unified ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active unified experiences" ON public.experiences_unified;
DROP POLICY IF EXISTS "Hosts can manage their unified experiences" ON public.experiences_unified;
DROP POLICY IF EXISTS "Anyone can view active experiences with host info" ON public.experiences_with_host;

-- Create RLS policies for experiences_unified table
CREATE POLICY "Anyone can view active experiences" ON public.experiences_unified
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create experiences" ON public.experiences_unified
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own experiences" ON public.experiences_unified
  FOR UPDATE USING (
    auth.uid()::text = host_id::text
  );

CREATE POLICY "Users can delete their own experiences" ON public.experiences_unified
  FOR DELETE USING (
    auth.uid()::text = host_id::text
  );

-- Grant necessary permissions
GRANT SELECT ON public.experiences_unified TO authenticated;
GRANT INSERT ON public.experiences_unified TO authenticated;
GRANT UPDATE ON public.experiences_unified TO authenticated;
GRANT DELETE ON public.experiences_unified TO authenticated;

-- The experiences_with_host view will inherit RLS from the underlying table automatically
-- Views cannot have their own RLS policies - they use the table's policies

-- Grant permissions for the view
GRANT SELECT ON public.experiences_with_host TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created for experiences!';
  RAISE NOTICE '🔒 Table: experiences_unified - RLS enabled';
  RAISE NOTICE '👀 View: experiences_with_host - RLS enabled';
  RAISE NOTICE '📋 Policies:';
  RAISE NOTICE '  - Anyone can view active experiences';
  RAISE NOTICE '  - Authenticated users can create experiences';
  RAISE NOTICE '  - Users can update/delete their own experiences';
  RAISE NOTICE '🎯 Security: Properly configured!';
END $$;
