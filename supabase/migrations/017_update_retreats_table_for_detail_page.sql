-- Migration: Update retreats table for optimized detail page
-- This migration adds host-related columns, USP columns, and removes max_guests

-- Add host-related columns to retreats table
ALTER TABLE public.retreats
ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT 'EJA',
ADD COLUMN IF NOT EXISTS host_type TEXT DEFAULT 'Retreat Guide',
ADD COLUMN IF NOT EXISTS host_tenure TEXT DEFAULT '4 years',
ADD COLUMN IF NOT EXISTS host_description TEXT DEFAULT 'EJA is a trusted wellness partner committed to providing exceptional retreat experiences. Our experienced guides are passionate about creating transformative journeys that nurture mind, body, and soul.',
ADD COLUMN IF NOT EXISTS host_image TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
ADD COLUMN IF NOT EXISTS host_usps TEXT[] DEFAULT ARRAY['Wellness Expertise', 'Personalized Care', 'Transformative Experience'];

-- Add unique propositions column for "What makes this retreat special"
ALTER TABLE public.retreats
ADD COLUMN IF NOT EXISTS unique_propositions TEXT[] DEFAULT ARRAY[
  'Exclusive access to pristine natural settings',
  'Expert-led wellness and mindfulness sessions',
  'Personalized wellness journey planning'
];

-- Add subtitle column for retreats
ALTER TABLE public.retreats
ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT 'Transformative wellness experience';

-- Remove max_guests column as requested (if it exists)
ALTER TABLE public.retreats DROP COLUMN IF EXISTS max_guests;

-- Update existing retreats to have reasonable default values
UPDATE public.retreats
SET
  host_name = 'EJA',
  host_type = 'Retreat Guide',
  host_tenure = '4 years',
  host_description = 'EJA is a trusted wellness partner committed to providing exceptional retreat experiences. Our experienced guides are passionate about creating transformative journeys that nurture mind, body, and soul.',
  host_image = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  host_usps = ARRAY['Wellness Expertise', 'Personalized Care', 'Transformative Experience'],
  unique_propositions = ARRAY[
    'Exclusive access to pristine natural settings',
    'Expert-led wellness and mindfulness sessions',
    'Personalized wellness journey planning'
  ],
  subtitle = COALESCE(subtitle, 'Transformative wellness experience')
WHERE host_name IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_retreats_host_name ON public.retreats(host_name);
CREATE INDEX IF NOT EXISTS idx_retreats_host_type ON public.retreats(host_type);
CREATE INDEX IF NOT EXISTS idx_retreats_unique_propositions ON public.retreats USING GIN (unique_propositions);
