-- Update experiences_unified table to set EJA as the host
-- This approach adds EJA information directly to the experiences_unified table

-- Add EJA host information columns to experiences_unified table
ALTER TABLE public.experiences_unified 
ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT 'EJA Experiences',
ADD COLUMN IF NOT EXISTS host_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
ADD COLUMN IF NOT EXISTS host_bio TEXT DEFAULT 'Curated experiences that connect you with local culture, authentic moments, and meaningful connections.',
ADD COLUMN IF NOT EXISTS host_usps TEXT[] DEFAULT ARRAY[
  'Curated by local experts',
  'Authentic cultural experiences', 
  'Small group experiences',
  'Safety-first approach',
  'Memorable moments guaranteed'
];

-- Update all experiences to have EJA host information
UPDATE public.experiences_unified 
SET 
  host_name = 'EJA Experiences',
  host_avatar = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  host_bio = 'Curated experiences that connect you with local culture, authentic moments, and meaningful connections.',
  host_usps = ARRAY[
    'Curated by local experts',
    'Authentic cultural experiences', 
    'Small group experiences',
    'Safety-first approach',
    'Memorable moments guaranteed'
  ]
WHERE host_name IS NULL OR host_name = '';

-- Make host_id nullable since we're not using it for EJA experiences
ALTER TABLE public.experiences_unified ALTER COLUMN host_id DROP NOT NULL;

-- Create a simple view that includes all EJA host information
CREATE OR REPLACE VIEW public.experiences_with_host AS
SELECT 
  id,
  title,
  description,
  location,
  mood,
  price,
  duration_hours,
  cover_image,
  gallery,
  is_active,
  created_at,
  updated_at,
  host_name,
  host_avatar,
  host_bio,
  host_usps
FROM public.experiences_unified
WHERE is_active = true;

-- Views inherit RLS from underlying tables automatically
-- No need to create policies on views - they use the table's policies

-- Grant permissions for the view
GRANT SELECT ON public.experiences_with_host TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ EJA host information added to experiences_unified table!';
  RAISE NOTICE '🏢 All experiences now show "EJA Experiences" as host';
  RAISE NOTICE '📊 Host columns added: host_name, host_avatar, host_bio, host_usps';
  RAISE NOTICE '👀 View created: experiences_with_host';
  RAISE NOTICE '🎯 Ready to use in your frontend!';
  RAISE NOTICE '💡 No foreign key constraints - much simpler approach!';
END $$;
