-- Add missing columns for property detail page

-- Add host-related columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS host_name TEXT DEFAULT 'EJA',
ADD COLUMN IF NOT EXISTS host_type TEXT DEFAULT 'Super Host',
ADD COLUMN IF NOT EXISTS host_tenure TEXT DEFAULT '5 years',
ADD COLUMN IF NOT EXISTS host_description TEXT DEFAULT 'EJA is a trusted hospitality partner committed to providing exceptional homestay experiences. We specialize in curating unique properties that offer authentic local experiences while ensuring comfort and safety for our guests.',
ADD COLUMN IF NOT EXISTS host_image TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
ADD COLUMN IF NOT EXISTS host_usps TEXT[] DEFAULT ARRAY['Warm Hospitality', 'Local Expertise', 'Quick Response'];

-- Add unique propositions column for "What makes this place special"
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS unique_propositions TEXT[] DEFAULT ARRAY[
  'Stunning mountain views from every room',
  'Authentic local cuisine prepared fresh daily',
  'Exclusive access to hidden hiking trails'
];

-- Add beds column (separate from bedrooms)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1;

-- Update existing properties to have reasonable default values
UPDATE public.properties 
SET 
  host_name = 'EJA',
  host_type = 'Super Host',
  host_tenure = '5 years',
  host_description = 'EJA is a trusted hospitality partner committed to providing exceptional homestay experiences. We specialize in curating unique properties that offer authentic local experiences while ensuring comfort and safety for our guests.',
  host_image = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  host_usps = ARRAY['Warm Hospitality', 'Local Expertise', 'Quick Response'],
  unique_propositions = ARRAY[
    'Stunning mountain views from every room',
    'Authentic local cuisine prepared fresh daily',
    'Exclusive access to hidden hiking trails'
  ],
  beds = bedrooms
WHERE host_name IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_host_name ON public.properties(host_name);
CREATE INDEX IF NOT EXISTS idx_properties_host_type ON public.properties(host_type);
