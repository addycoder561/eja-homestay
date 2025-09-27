-- Insert retreats data
-- This script inserts 16 retreats into the retreats table

-- First, make host_id nullable to allow NULL values
ALTER TABLE public.retreats ALTER COLUMN host_id DROP NOT NULL;

INSERT INTO public.retreats (
  host_id,
  title,
  description,
  location,
  categories,
  price,
  cover_image,
  gallery,
  is_active
) VALUES
(
  NULL, -- host_id (can be updated later)
  'Break-Up Retreat',
  'Heal, reflect, and rediscover yourself in the calm of the mountains.',
  'Mountains',
  ARRAY['Couple'],
  9999.00,
  'https://images.unsplash.com/photo-1679734074728-42cd4473a7f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MjZ8NkQ0ekxUZndXMTR8fGVufDB8fHx8fA%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Senior Citizen Retreat',
  'Gentle adventures and soulful bonding designed for golden years.',
  'Mountains',
  ARRAY['Try'],
  8499.00,
  'https://images.unsplash.com/photo-1542622475-904e18612fa1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Single Parent Retreat',
  'A safe, supportive space for parents and kids to connect and thrive.',
  'Mountains',
  ARRAY['Try'],
  8799.00,
  'https://images.unsplash.com/photo-1641034189433-d2e405da28de?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Corporate Retreat',
  'Build teamwork, clarity, and fresh ideas away from office walls.',
  'Mountains',
  ARRAY['Group'],
  12999.00,
  'https://images.unsplash.com/photo-1590650046871-92c887180603?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Silent Retreat',
  'Disconnect from noise, reconnect with yourself in pure silence.',
  'Mountains',
  ARRAY['Try'],
  9799.00,
  'https://images.unsplash.com/photo-1637331684414-1af2c97b7f9c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Engineers Retreat',
  'A geek''s getaway with treks, hacks, and fireside problem-solving.',
  'Mountains',
  ARRAY['Group'],
  8999.00,
  'https://images.unsplash.com/photo-1704613268157-c7b81247e673?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Wellness Retreat',
  'Yoga, meditation, and holistic healing in serene mountain settings.',
  'Mountains',
  ARRAY['Try'],
  10999.00,
  'https://images.unsplash.com/photo-1644612105654-b6b0a941ecde?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Doctors Retreat',
  'Relax, recharge, and share stories with peers who heal the world.',
  'Mountains',
  ARRAY['Group'],
  9599.00,
  'https://images.unsplash.com/photo-1659353887520-d48dadc80767?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Re-unions Retreat',
  'Rekindle old bonds and create fresh memories with long-lost friends.',
  'Mountains',
  ARRAY['Group'],
  9899.00,
  'https://images.unsplash.com/photo-1561910775-891020e392e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Family Getaways',
  'Quality time with your loved ones, no distractions — just nature.',
  'Mountains',
  ARRAY['Family'],
  10499.00,
  'https://images.unsplash.com/photo-1648221350871-e3ae3c8d0f58?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'First Trip Retreat',
  'A gentle, guided first-time adventure for new explorers.',
  'Mountains',
  ARRAY['Try'],
  8999.00,
  'https://images.unsplash.com/photo-1691028991676-99ce132ce560?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Patch-Up Retreat',
  'Reignite love and rebuild connections with meaningful experiences.',
  'Mountains',
  ARRAY['Couple'],
  9499.00,
  'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8Mzh8NkQ0ekxUZndXMTR8fGVufDB8fHx8fA%3D%3D',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Cousins Meetup Retreat',
  'Relive childhood fun with cousins in a playful mountain escape.',
  'Mountains',
  ARRAY['Group'],
  9299.00,
  'https://images.unsplash.com/photo-1640577485169-cbbd317aa671?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Sibling Reconnect Retreat',
  'Strengthen your sibling bond with shared adventures.',
  'Mountains',
  ARRAY['Group'],
  9199.00,
  'https://images.unsplash.com/photo-1634233454980-a5c97bc6cb56?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8Mnw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Pet Parent Retreat',
  'Fur babies welcome! Travel, trek, and chill together.',
  'Mountains',
  ARRAY['Try'],
  9199.00,
  'https://images.unsplash.com/photo-1698895495483-a02f31e1be39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
),
(
  NULL,
  'Specially-Abled Getaways',
  'Accessible experiences that celebrate inclusivity and joy.',
  'Mountains',
  ARRAY['Try'],
  8499.00,
  'https://images.unsplash.com/photo-1698895495483-a02f31e1be39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw2RDR6TFRmd1cxNHx8ZW58MHx8fHx8',
  '[]'::jsonb,
  TRUE
);

-- Verify the data was inserted
SELECT 
  id,
  title,
  location,
  categories,
  price,
  is_active,
  created_at
FROM public.retreats 
ORDER BY created_at DESC;
