-- Update experiences with their proper categories
-- This script will set the correct category for each experience

UPDATE experiences SET categories = 'Immersive' WHERE title IN (
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

UPDATE experiences SET categories = 'Playful' WHERE title IN (
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

UPDATE experiences SET categories = 'Culinary' WHERE title IN (
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

UPDATE experiences SET categories = 'Meaningful' WHERE title IN (
  'Animal rescue',
  'Litter collection',
  'Food distribution',
  'Celebrating staff birthday',
  'Cancer-patient visits',
  'Time Volunteering'
);

-- Verify the updates
SELECT title, categories FROM experiences ORDER BY categories, title;
