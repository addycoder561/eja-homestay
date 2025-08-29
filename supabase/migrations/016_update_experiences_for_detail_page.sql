-- Migration: Update experiences table for optimized detail page
-- This migration adds host-related columns, USP columns, and removes max_guests

-- Add host-related columns to experiences table
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT 'EJA',
ADD COLUMN IF NOT EXISTS host_type TEXT DEFAULT 'Experience Guide',
ADD COLUMN IF NOT EXISTS host_tenure TEXT DEFAULT '3 years',
ADD COLUMN IF NOT EXISTS host_description TEXT DEFAULT 'EJA is a trusted travel partner committed to providing exceptional local experiences. Our experienced guides are passionate about sharing authentic local culture and creating memorable adventures for our guests.',
ADD COLUMN IF NOT EXISTS host_image TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
ADD COLUMN IF NOT EXISTS host_usps TEXT[] DEFAULT ARRAY['Local Expertise', 'Safety First', 'Personalized Experience'];

-- Add unique propositions column for "What makes this experience special"
ALTER TABLE public.experiences 
ADD COLUMN IF NOT EXISTS unique_propositions TEXT[] DEFAULT ARRAY[
  'Exclusive access to hidden local spots',
  'Authentic cultural immersion experience',
  'Professional photography included'
];

-- Remove max_guests column as requested
ALTER TABLE public.experiences DROP COLUMN IF EXISTS max_guests;

-- Update existing experiences to have reasonable default values
UPDATE public.experiences 
SET 
  host_name = 'EJA',
  host_type = 'Experience Guide',
  host_tenure = '3 years',
  host_description = 'EJA is a trusted travel partner committed to providing exceptional local experiences. Our experienced guides are passionate about sharing authentic local culture and creating memorable adventures for our guests.',
  host_image = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  host_usps = ARRAY['Local Expertise', 'Safety First', 'Personalized Experience'],
  unique_propositions = ARRAY[
    'Exclusive access to hidden local spots',
    'Authentic cultural immersion experience',
    'Professional photography included'
  ]
WHERE host_name IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_experiences_host_name ON public.experiences(host_name);
CREATE INDEX IF NOT EXISTS idx_experiences_host_type ON public.experiences(host_type);
CREATE INDEX IF NOT EXISTS idx_experiences_unique_propositions ON public.experiences USING GIN (unique_propositions);
