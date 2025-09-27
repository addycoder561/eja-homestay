-- Experiences Data for EJA Homestay
-- This script creates the 22 experiences provided by the user
-- Mix of Delhi-NCR local experiences and India-wide online experiences

-- First, make host_id nullable for experiences table
ALTER TABLE public.experiences ALTER COLUMN host_id DROP NOT NULL;

INSERT INTO public.experiences (id, host_id, title, description, location, categories, mood, price, duration_hours, cover_image, gallery, is_active, created_at, updated_at) VALUES

-- Delhi-NCR Local Experiences
(gen_random_uuid(), NULL, 'Heritage Tour', 'Walk through living history, where every stone tells a story.', 'Delhi-NCR', '{"Immersive"}', 'Adventure', 499, 2, 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Karaoke Nights', 'Sing your heart out, no judgments—only vibes.', 'Delhi-NCR', '{"Immersive"}', 'Playful', 399, 2.5, 'https://images.unsplash.com/photo-1584140380141-30f09812653f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'PUBG', 'Squad up offline, battle royale brought to life.', 'Delhi-NCR', '{"Immersive"}', 'Playful', 399, 2, 'https://images.unsplash.com/photo-1633450797384-9242a83a7597?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Festival Immersion', 'Dance, rituals, and homemade food with real families.', 'Delhi-NCR', '{"Immersive"}', 'Playful', 1499, 4, 'https://images.unsplash.com/photo-1603689200436-b212c976c011?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Music Festival', 'Lose yourself where the beats never stop.', 'Delhi-NCR', '{"Immersive"}', 'Playful', 1999, 4, 'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Spiritual Tour', 'Inner peace meets outer journey.', 'Delhi-NCR', '{"Immersive"}', 'Meaningful', 999, 4, 'https://images.unsplash.com/photo-1641309048970-d1a630d29f71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Art n Craft', 'Create, color, and carry a piece of culture home.', 'Delhi-NCR', '{"Immersive"}', 'Creative', 699, 2, 'https://images.unsplash.com/photo-1577745132636-af661b04b8b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Cycling Tour', 'Two wheels, endless discoveries.', 'Delhi-NCR', '{"Immersive"}', 'Adventure', 799, 3, 'https://images.unsplash.com/photo-1612614207927-64873c7e4c6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Open Mic Night', 'Your voice, your stage, your story.', 'Delhi-NCR', '{"Immersive"}', 'Creative', 499, 2.5, 'https://images.unsplash.com/photo-1719437364589-17a545612428?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Graffiti', 'Paint the streets, leave your mark.', 'Delhi-NCR', '{"Immersive"}', 'Creative', 799, 2.5, 'https://images.unsplash.com/photo-1525184754968-2eecda05975d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Walking Tour', 'Step by step, uncover the city''s secrets.', 'Delhi-NCR', '{"Immersive"}', 'Adventure', 599, 1.75, 'https://images.unsplash.com/photo-1612354891044-bd9d20085c61?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Street Food Tour', 'Taste the real city, one bite at a time.', 'Delhi-NCR', '{"Culinary"}', 'Foodie', 799, 2.5, 'https://images.unsplash.com/photo-1621334721541-370a13974de8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Mystic Trails', 'Trek into tales, myths, and mysteries.', 'Delhi-NCR', '{"Immersive"}', 'Adventure', 1499, 4, 'https://images.unsplash.com/photo-1585229507800-53b334658e2b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Birthday Surprise', 'A celebration you''ll never see coming.', 'Delhi-NCR', '{"Immersive"}', 'Playful', 2999, 0, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Community Dining', 'Strangers today, family by dessert.', 'Delhi-NCR', '{"Culinary"}', 'Foodie', 799, 2, 'https://images.unsplash.com/photo-1739440426771-8265663f8899?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Stranger Potluck', 'Everyone brings food, everyone leaves with stories.', 'Delhi-NCR', '{"Culinary"}', 'Foodie', 299, 2.5, 'https://images.unsplash.com/photo-1626398996339-ce51715b15c1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Photography tour', 'Capture moments, frame memories.', 'Delhi-NCR', '{"Immersive"}', 'Creative', 999, 3, 'https://images.unsplash.com/photo-1564622598035-61122bd729ef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Theatre', 'Lights on, curtains up, emotions alive.', 'Delhi-NCR', '{"Immersive"}', 'Creative', 799, 2, 'https://images.unsplash.com/photo-1576724196706-3f23f51ea351?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'The Gratitude Trek', 'Hike with heart, return with gratitude.', 'Delhi-NCR', '{"Immersive"}', 'Meaningful', 1999, 4, 'https://images.unsplash.com/photo-1699520497348-9d6670d177d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8', '[]', true, NOW(), NOW()),

-- India-wide Online Experiences
(gen_random_uuid(), NULL, 'Speed Friending', 'Two Truths & a Lie, Would You Rather, Hot Seat.', 'India', '{"Online"}', 'Playful', 149, 1, 'https://images.unsplash.com/photo-1582578598774-a377d4b32223?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dHdvJTIwZnJpZW5kc3xlbnwwfHwwfHx8Mg%3D%3D', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Bonding Friends', 'Deep Questions Night, Dream Exchange, Future-Self Letters, Nostalgia Night.', 'India', '{"Online"}', 'Meaningful', 199, 1.25, 'https://images.unsplash.com/photo-1497699238310-892cfa1fedb7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHR3byUyMGZyaWVuZHN8ZW58MHx8MHx8fDI%3D', '[]', true, NOW(), NOW()),

(gen_random_uuid(), NULL, 'Community Circle', 'Online house party- Pass the Story, Secret Talent Show, Cultural Swap, Music Cover.', 'India', '{"Online"}', 'Playful', 299, 3, 'https://images.unsplash.com/photo-1582016609297-053772cc6649?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fDQlMjA4JTIwZnJpZW5kc3xlbnwwfHwwfHx8Mg%3D%3D', '[]', true, NOW(), NOW());
