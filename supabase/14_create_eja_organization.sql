-- Create EJA Organization Profile
-- This script creates a special EJA organization profile for experiences
-- that are created and managed by EJA rather than individual hosts

-- Insert EJA organization profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  is_host,
  host_bio,
  host_usps,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Fixed UUID for EJA organization
  'experiences@eja.com',
  'EJA Experiences',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  true,
  'Curated experiences that connect you with local culture, authentic moments, and meaningful connections. From hyper-local adventures to online communities, we bring the world closer to you.',
  ARRAY[
    'Curated by local experts',
    'Authentic cultural experiences', 
    'Small group experiences',
    'Safety-first approach',
    'Memorable moments guaranteed'
  ],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  host_bio = EXCLUDED.host_bio,
  host_usps = EXCLUDED.host_usps,
  updated_at = NOW();

-- Update all existing experiences to reference EJA organization
UPDATE public.experiences 
SET host_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE host_id IS NULL;

-- Update all existing retreats to reference EJA organization  
UPDATE public.retreats
SET host_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE host_id IS NULL;

-- Make host_id NOT NULL again for experiences and retreats
ALTER TABLE public.experiences ALTER COLUMN host_id SET NOT NULL;
ALTER TABLE public.retreats ALTER COLUMN host_id SET NOT NULL;

-- Create a view for EJA experiences with organization details
CREATE OR REPLACE VIEW public.eja_experiences_view AS
SELECT 
  e.id,
  e.title,
  e.description,
  e.location,
  e.categories,
  e.mood,
  e.price,
  e.duration_hours,
  e.cover_image,
  e.gallery,
  e.is_active,
  e.created_at,
  e.updated_at,
  p.full_name as host_name,
  p.avatar_url as host_avatar,
  p.host_bio as host_bio,
  p.host_usps as host_usps
FROM public.experiences e
JOIN public.profiles p ON e.host_id = p.id
WHERE e.is_active = true;

-- Create a view for EJA retreats with organization details
CREATE OR REPLACE VIEW public.eja_retreats_view AS
SELECT 
  r.id,
  r.title,
  r.description,
  r.location,
  r.categories,
  r.price,
  r.cover_image,
  r.gallery,
  r.is_active,
  r.created_at,
  r.updated_at,
  p.full_name as host_name,
  p.avatar_url as host_avatar,
  p.host_bio as host_bio,
  p.host_usps as host_usps
FROM public.retreats r
JOIN public.profiles p ON r.host_id = p.id
WHERE r.is_active = true;

-- Grant permissions for the views
GRANT SELECT ON public.eja_experiences_view TO authenticated;
GRANT SELECT ON public.eja_retreats_view TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ EJA Organization profile created successfully!';
  RAISE NOTICE '🏢 Organization ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '📊 All experiences and retreats now reference EJA organization';
  RAISE NOTICE '👀 Views created: eja_experiences_view, eja_retreats_view';
END $$;
