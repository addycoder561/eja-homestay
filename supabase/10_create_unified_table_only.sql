-- =====================================================
-- EJA Homestay - Create Unified Experiences Table Only
-- =====================================================
-- This script creates the unified experiences table structure
-- for CSV upload. Run this first, then upload the CSV data.
-- =====================================================

-- Step 0: Clean up any existing table from previous attempts
DROP TABLE IF EXISTS public.experiences_unified CASCADE;

-- Step 1: Create the unified experiences table
CREATE TABLE IF NOT EXISTS public.experiences_unified (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  mood TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_hours INTEGER, -- NULL for retreats, filled for experiences
  cover_image TEXT,
  gallery JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiences_unified_host_id ON public.experiences_unified(host_id);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_active ON public.experiences_unified(is_active);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_location ON public.experiences_unified(location);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_mood ON public.experiences_unified(mood);
CREATE INDEX IF NOT EXISTS idx_experiences_unified_duration ON public.experiences_unified(duration_hours);

-- Step 3: Enable RLS
ALTER TABLE public.experiences_unified ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Anyone can view active unified experiences" ON public.experiences_unified
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their unified experiences" ON public.experiences_unified
  FOR ALL USING (auth.uid()::text = host_id::text);

-- Step 5: Create trigger for updated_at
CREATE TRIGGER update_experiences_unified_updated_at
  BEFORE UPDATE ON public.experiences_unified
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Completion message
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ Unified Experiences Table Created Successfully!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '📊 Table: experiences_unified';
  RAISE NOTICE '🔒 RLS enabled and policies created';
  RAISE NOTICE '📈 Indexes created for performance';
  RAISE NOTICE '🎯 Ready for CSV upload';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Run the export script (09_export_unified_experiences.sql)';
  RAISE NOTICE '2. Copy the results to a CSV file';
  RAISE NOTICE '3. Upload CSV to Supabase Table Editor';
  RAISE NOTICE '4. Update retreat_experiences references';
  RAISE NOTICE '=====================================================';
END $$;
