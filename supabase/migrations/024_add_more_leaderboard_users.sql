-- Add more sample users and stories for a better leaderboard
-- This will create 3 more users with different numbers of smiles

-- First, create users in auth.users table (required for foreign key constraint)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token) VALUES
('00000000-0000-0000-0000-000000000002', 'mike.chen@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('00000000-0000-0000-0000-000000000003', 'emma.rodriguez@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),
('00000000-0000-0000-0000-000000000004', 'david.thompson@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Insert additional sample profiles
INSERT INTO profiles (id, full_name, email) VALUES
('00000000-0000-0000-0000-000000000002', 'Mike Chen', 'mike.chen@example.com'),
('00000000-0000-0000-0000-000000000003', 'Emma Rodriguez', 'emma.rodriguez@example.com'),
('00000000-0000-0000-0000-000000000004', 'David Thompson', 'david.thompson@example.com')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Get task IDs for additional stories
DO $$
DECLARE
    task4_id UUID;
    task5_id UUID;
    task6_id UUID;
    task7_id UUID;
    task8_id UUID;
    task9_id UUID;
    task10_id UUID;
BEGIN
    -- Get task IDs
    SELECT id INTO task4_id FROM delight_tasks WHERE title = 'Donate Blood' LIMIT 1;
    SELECT id INTO task5_id FROM delight_tasks WHERE title = 'Mentor a Student' LIMIT 1;
    SELECT id INTO task6_id FROM delight_tasks WHERE title = 'Clean a Park' LIMIT 1;
    SELECT id INTO task7_id FROM delight_tasks WHERE title = 'Help Elderly' LIMIT 1;
    SELECT id INTO task8_id FROM delight_tasks WHERE title = 'Plant Flowers' LIMIT 1;
    SELECT id INTO task9_id FROM delight_tasks WHERE title = 'Recycle Waste' LIMIT 1;
    SELECT id INTO task10_id FROM delight_tasks WHERE title = 'Volunteer at Library' LIMIT 1;
    
    -- Insert additional stories for Mike Chen (5 smiles - rank 1)
    INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
    (task4_id, '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56', 'Donated blood today at the local blood bank. It feels great to know this could save someone''s life!', 40.7128, -74.0060, true),
    (task5_id, '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', 'Spent 2 hours mentoring a high school student in math. Seeing their confidence grow was amazing!', 34.0522, -118.2437, true),
    (task6_id, '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 'Cleaned up the local park with friends. Collected 8 bags of trash and made the park beautiful again!', 41.8781, -87.6298, true),
    (task7_id, '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', 'Helped Mrs. Johnson with her groceries and spent time chatting. The elderly deserve our care and attention.', 29.7604, -95.3698, true),
    (task8_id, '00000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946', 'Planted beautiful flowers in the community garden. The colors will brighten everyone''s day!', 33.7490, -84.3880, true);
    
    -- Insert additional stories for Emma Rodriguez (4 smiles - rank 2)
    INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
    (task9_id, '00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b', 'Organized a recycling drive in my neighborhood. Collected 50 pounds of recyclables!', 40.7128, -74.0060, true),
    (task10_id, '00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', 'Volunteered at the local library helping kids with reading. Their enthusiasm was contagious!', 34.0522, -118.2437, true),
    (task4_id, '00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56', 'Donated blood for the third time this year. Every donation counts!', 41.8781, -87.6298, true),
    (task5_id, '00000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', 'Mentored a college student in computer science. Technology education is so important!', 29.7604, -95.3698, true);
    
    -- Insert additional stories for David Thompson (2 smiles - rank 3)
    INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
    (task6_id, '00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', 'Cleaned up the beach with my family. Teaching kids about environmental responsibility!', 33.7490, -84.3880, true),
    (task7_id, '00000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', 'Helped my elderly neighbor with yard work. Small acts of kindness make a big difference!', 40.7128, -74.0060, true);
    
    -- Update smile counts for tasks with new stories
    UPDATE delight_smiles SET smile_count = 2 WHERE task_id = task4_id;
    UPDATE delight_smiles SET smile_count = 2 WHERE task_id = task5_id;
    UPDATE delight_smiles SET smile_count = 2 WHERE task_id = task6_id;
    UPDATE delight_smiles SET smile_count = 2 WHERE task_id = task7_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task8_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task9_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task10_id;
    
    -- Insert points for all new stories
    INSERT INTO delight_points (user_id, task_id, story_id, base_points, doubled_points, total_points, is_doubled) 
    SELECT 
        ds.user_id,
        ds.task_id,
        ds.id,
        1500,
        0,
        1500,
        false
    FROM delight_stories ds
    WHERE ds.user_id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004')
    AND ds.is_approved = true
    AND NOT EXISTS (SELECT 1 FROM delight_points dp WHERE dp.story_id = ds.id);
    
END $$;
