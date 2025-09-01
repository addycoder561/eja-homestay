-- Seed: Insert six new retreats
-- Table: public.retreats
-- Note: categories is TEXT in schema. We'll store a single category string
-- matching the user's provided grouping. Images stored as a small array.

INSERT INTO public.retreats (
  host_id,
  title,
  subtitle,
  description,
  location,
  categories,
  price,
  images,
  cover_image,
  duration,
  is_active
) VALUES
  (
    NULL,
    'Specially-Abled Getaways',
    'Accessible travel designed with care',
    'Thoughtfully curated retreats with step-free access, supportive staff, and inclusive activities for diverse mobility needs. Ideal for groups seeking comfort, dignity, and memorable shared experiences.',
    'Mountains',
    'Group',
    8999,
    ARRAY[
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523419409543-a7d2b09f5b2b?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    '2N/3D',
    TRUE
  ),
  (
    NULL,
    'Second Chances Retreat',
    'Reconnect, reset, and rise stronger',
    'A gentle couple-focused program blending nature, guided conversations, and mindful practices to rebuild trust, rediscover joy, and create a new chapter together.',
    'Mountains',
    'Couple',
    10999,
    ARRAY[
      'https://images.unsplash.com/photo-1529336953128-a85760f31659?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    '2N/3D',
    TRUE
  ),
  (
    NULL,
    'Doctors Retreat',
    'Deep rest for those who care for all',
    'A restorative group retreat for medical professionals featuring silent mornings, breathwork, light treks, and nutrition-forward meals to decompress, reflect, and recharge.',
    'Mountains',
    'Group',
    11999,
    ARRAY[
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?auto=format&fit=crop&w=1600&q=80',
    '3N/4D',
    TRUE
  ),
  (
    NULL,
    'Engineers Retreat',
    'Unplug, build clarity, return inspired',
    'A maker-minded nature escape designed for product thinkers and engineers—hiking, sauna-style recovery, journaling sprints, and campfire ideation to reset focus and creativity.',
    'Mountains',
    'Group',
    9999,
    ARRAY[
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80',
    '2N/3D',
    TRUE
  ),
  (
    NULL,
    'First Relationship Retreat',
    'Grow together with intention',
    'A heart-first retreat for young couples—playful activities, communication workshops, mindful sunrise walks, and simple rituals to build trust and shared meaning.',
    'Mountains',
    'Couple',
    8999,
    ARRAY[
      'https://images.unsplash.com/photo-1497302347632-904729bc24aa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1497302347632-904729bc24aa?auto=format&fit=crop&w=1600&q=80',
    '2N/3D',
    TRUE
  ),
  (
    NULL,
    'First Startup Retreat',
    'From idea to momentum, together',
    'A high-energy group retreat for early founders—nature resets, lightweight strategy workshops, peer feedback circles, and pitch campfires to unlock clarity and momentum.',
    'Mountains',
    'Group',
    12999,
    ARRAY[
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?auto=format&fit=crop&w=1200&q=80'
    ],
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
    '3N/4D',
    TRUE
  );

-- Optional: touch updated_at
UPDATE public.retreats SET updated_at = NOW() WHERE title IN (
  'Specially-Abled Getaways',
  'Second Chances Retreat',
  'Doctors Retreat',
  'Engineers Retreat',
  'First Relationship Retreat',
  'First Startup Retreat'
);


