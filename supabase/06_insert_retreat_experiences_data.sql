-- Insert retreat experiences data
-- This script inserts 17 retreat experiences and links them to appropriate retreats

-- First, make sure we can insert retreat experiences
-- The retreat_experiences table should already allow NULL retreat_id, but let's be safe

INSERT INTO public.retreat_experiences (
  retreat_id,
  title,
  description,
  experience_type,
  cover_image,
  gallery,
  is_active
) VALUES
-- Tight Budget Experiences (₹1,500 - ₹2,500)
(
  (SELECT id FROM public.retreats WHERE title = 'Break-Up Retreat' LIMIT 1),
  'River Dip',
  'Guided sunrise or sunset dip in a pristine mountain river with simple breathwork and safety support.',
  'tight budget',
  'https://images.unsplash.com/photo-1605134789226-f095e700944d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Senior Citizen Retreat' LIMIT 1),
  'The Fire Circle',
  'Community bonfire with acoustic music, poetry, and shared traveler tales under the stars.',
  'tight budget',
  'https://images.unsplash.com/photo-1593976243570-64e54b3c42b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEJvbmZpcmV8ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Single Parent Retreat' LIMIT 1),
  'Pickle & Preserve Party',
  'Hands-on workshop to craft traditional pickles or clarified-butter preserves using family recipes.',
  'tight budget',
  'https://images.unsplash.com/photo-1576020301507-5d5a00982053?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8UGlja2xlfGVufDB8fDB8fHwy',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'First Trip Retreat' LIMIT 1),
  'Sweet-Making with the Local Auntie',
  'Learn and cook a beloved dessert recipe in a village kitchen and take home your creations.',
  'tight budget',
  'https://images.unsplash.com/photo-1605194000384-439c3ced8d15?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFkb298ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Pet Parent Retreat' LIMIT 1),
  'River Dip',
  'Guided sunrise or sunset dip in a pristine mountain river with simple breathwork and safety support.',
  'tight budget',
  'https://images.unsplash.com/photo-1605134789226-f095e700944d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Specially-Abled Getaways' LIMIT 1),
  'The Fire Circle',
  'Community bonfire with acoustic music, poetry, and shared traveler tales under the stars.',
  'tight budget',
  'https://images.unsplash.com/photo-1593976243570-64e54b3c42b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEJvbmZpcmV8ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
),

-- Family Comfort Experiences (₹2,501 - ₹5,000)
(
  (SELECT id FROM public.retreats WHERE title = 'Silent Retreat' LIMIT 1),
  'Forest Bathing (Shinrin-Yoku Walk)',
  'Slow, meditative walk through old-growth forest led by a wellness guide to heighten senses and reduce stress.',
  'family comfort',
  'https://images.unsplash.com/photo-1535075735949-8f0fce35fcac?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Rm9yZXN0JTIwQmF0aGluZyUyMChTaGlucmluJTIwWW9rdSUyMFdhbGspfGVufDB8fDB8fHwy',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Wellness Retreat' LIMIT 1),
  'Spirits of the Valley',
  'Twilight storytelling session featuring regional legends, folk music, and locally brewed drinks or herbal teas.',
  'family comfort',
  'https://images.unsplash.com/photo-1546778316-dfda79f1c84e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Rm9sa2xvcmV8ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Family Getaways' LIMIT 1),
  'Native Food Tasting',
  'Curated tasting of essential regional dishes hosted by a local culinary guide.',
  'family comfort',
  'https://images.unsplash.com/photo-1723361750187-4ae34fc0dde2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fE5hdGl2ZSUyMEZvb2QlMjBUYXN0aW5nfGVufDB8fDB8fHwy',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Patch-Up Retreat' LIMIT 1),
  'Cooking w/ Chef',
  'Interactive cooking class with a professional chef focusing on seasonal, regional flavors.',
  'family comfort',
  'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q2hlZnxlbnwwfHwwfHx8Mg%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Cousins Meetup Retreat' LIMIT 1),
  'Themed/Casual Dining',
  'Chef-designed dinner built around a seasonal or cultural theme in a relaxed setting.',
  'family comfort',
  'https://images.unsplash.com/photo-1583254130193-563e6cb1fe44?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8VGhlbWVkJTIwRGluaW5nfGVufDB8fDB8fHwy',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Sibling Reconnect Retreat' LIMIT 1),
  'Farm-to-Table Forage',
  'Forage for seasonal ingredients with a guide, then cook a communal meal using your harvest.',
  'family comfort',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8T3JnYW5pYyUyMGZvb2R8ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Re-unions Retreat' LIMIT 1),
  'Local Cuisines Tasting',
  'Guided sampling of multiple regional delicacies in a single curated session.',
  'family comfort',
  'https://images.unsplash.com/photo-1641638260951-e97fe77d8b86?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TG9jYWwlMjBDdWlzaW5lcyUyMFRhc3Rpbmd8ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Doctors Retreat' LIMIT 1),
  'Heritage Recipe Revival',
  'Cook and document a nearly forgotten recipe alongside local elders and storytellers.',
  'family comfort',
  'https://images.unsplash.com/photo-1565882916152-4e9c2cba84e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEhlcml0YWdlJTIwUmVjaXBlJTIwUmV2aXZhbHxlbnwwfHwwfHx8Mg%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Engineers Retreat' LIMIT 1),
  'Gastronomic Tours',
  'Multi-stop walking or driving tour of iconic food spots and hidden gems.',
  'family comfort',
  'https://images.unsplash.com/photo-1707635569223-c759b3b0501b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8R2FzdHJvbm9taWMlMjBUb3Vyc3xlbnwwfHwwfHx8Mg%3D%3D',
  '[]'::jsonb,
  TRUE
),

-- Premium Experiences (₹5,001 - ₹7,500)
(
  (SELECT id FROM public.retreats WHERE title = 'Corporate Retreat' LIMIT 1),
  'Glamp & Gaze',
  'Overnight luxury glamping with professional stargazing and telescope viewing.',
  'premium',
  'https://images.unsplash.com/photo-1554968756-e41553ee4eb9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEdsYW1waW5nfGVufDB8fDB8fHwy',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Break-Up Retreat' LIMIT 1),
  'Private Forest Dinner',
  'Exclusive multi-course meal set in a lantern-lit forest clearing with dedicated service.',
  'premium',
  'https://images.unsplash.com/photo-1577215652871-b78d50c65150?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UHJpdmF0ZSUyMEZvcmVzdCUyMERpbm5lcnxlbnwwfHwwfHx8Mg%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Patch-Up Retreat' LIMIT 1),
  'Candlelight Dinner Under the Stars',
  'Romantic, fully serviced open-air dinner with telescope viewing and soft live music.',
  'premium',
  'https://images.unsplash.com/photo-1691067987422-befcaaaf3e45?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fENhbmRsZWxpZ2h0JTIwRGlubmVyJTIwVW5kZXIlMjB0aGUlMjBTdGFyc3xlbnwwfHwwfHx8Mg%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  (SELECT id FROM public.retreats WHERE title = 'Wellness Retreat' LIMIT 1),
  'Guest Chef Night',
  'One-night pop-up dining experience hosted by a visiting culinary artist.',
  'premium',
  'https://images.unsplash.com/photo-1659468550823-3fc043085f40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8R3Vlc3QlMjBDaGVmJTIwTmlnaHR8ZW58MHx8MHx8fDI%3D',
  '[]'::jsonb,
  TRUE
);

-- Verify the data was inserted
SELECT 
  re.id,
  re.title,
  re.experience_type,
  r.title as retreat_title,
  re.is_active,
  re.created_at
FROM public.retreat_experiences re
LEFT JOIN public.retreats r ON re.retreat_id = r.id
ORDER BY re.experience_type, re.title;
