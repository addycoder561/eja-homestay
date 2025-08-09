-- Fix Categories for All Experiences
-- Copy and paste this entire script into Supabase SQL Editor

-- Update Immersive Experiences
UPDATE experiences SET categories = ARRAY['Immersive'] WHERE title IN (
  'Glamp & Gaze',
  'Spirits of the Valley',
  'The Fire Circle',
  'Forest Bathing (Shinrin-Yoku Walk)',
  'River Dip',
  'Portrait Project',
  'Make Your Own Dreamcatcher or Charm',
  'Gift a Stranger',
  'Festival Immersion',
  'Birthday',
  'Heritage Tour',
  'Spiritual Tour'
);

-- Update Playful Experiences
UPDATE experiences SET categories = ARRAY['Playful'] WHERE title IN (
  'Paint the Mountains',
  'PUBG',
  'Music Festival',
  'Karaoke Nights',
  'Music Covers',
  'Mountain Mic Night',
  'Traditional Dance or Rhythm Session',
  'Pottery',
  'Bamboo or Jute Craft',
  'Puppet Show',
  'Art n Craft',
  'Theatre',
  'Crash Course in Local Language or Script',
  'Photography tour',
  'Cycling Tour',
  'Walking Tour',
  'Mystic Trails',
  'The Gratitude Trek'
);

-- Update Culinary Experiences
UPDATE experiences SET categories = ARRAY['Culinary'] WHERE title IN (
  'Farm-to-Table Forage',
  'Private Forest Dinner',
  'Candlelight Dinner Under the Stars',
  'Themed/Casual dining',
  'Cooking w/ chef',
  'Guest Chef Night',
  'Community Potluck/Dining',
  'Potlucks/Picnics',
  'Heritage Recipe Revival',
  'Pickle & Preserve Party (Ghee)',
  'Sweet-Making with the Local Auntie',
  'Local cuisines tasting',
  'Native Food Tasting',
  'Street Food Tour',
  'Local Spices Tour',
  'Gastronomic tours'
);

-- Update Meaningful Experiences
UPDATE experiences SET categories = ARRAY['Meaningful'] WHERE title IN (
  'Animal rescue',
  'Litter collection',
  'Food distribution',
  'Celebrating staff birthday',
  'Cancer-patient visits',
  'Time Volunteering'
);

-- Verify all updates
SELECT title, categories FROM experiences ORDER BY categories, title;
