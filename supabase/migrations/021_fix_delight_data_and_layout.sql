-- Fix delight data and add real sample stories
-- This will create actual sample stories that will show on the frontend

-- First, let's get some task IDs to reference
DO $$
DECLARE
    task1_id UUID;
    task2_id UUID;
    task3_id UUID;
    sample_user_id UUID;
BEGIN
    -- Get task IDs
    SELECT id INTO task1_id FROM delight_tasks WHERE title = 'Plant a Tree' LIMIT 1;
    SELECT id INTO task2_id FROM delight_tasks WHERE title = 'Clean a Beach' LIMIT 1;
    SELECT id INTO task3_id FROM delight_tasks WHERE title = 'Help Animals' LIMIT 1;
    
    -- Get a sample user ID (we'll use a placeholder for now)
    -- In a real scenario, this would be an actual user from auth.users
    sample_user_id := '00000000-0000-0000-0000-000000000001'::UUID;
    
    -- Insert sample delight stories (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM delight_stories WHERE task_id = task1_id LIMIT 1) THEN
        INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
        (task1_id, sample_user_id, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80', 'Just planted a beautiful oak tree in our community park! The sapling is healthy and ready to grow. This will provide shade and oxygen for generations to come.', 40.7128, -74.0060, true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM delight_stories WHERE task_id = task2_id LIMIT 1) THEN
        INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
        (task2_id, sample_user_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Spent 3 hours cleaning up the local beach today. Collected 15 bags of trash including plastic bottles, fishing nets, and other debris. The beach looks much cleaner now!', 34.0522, -118.2437, true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM delight_stories WHERE task_id = task3_id LIMIT 1) THEN
        INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
        (task3_id, sample_user_id, 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80', 'Volunteered at the local animal shelter today. Fed the dogs, cleaned their kennels, and gave them some much-needed love and attention. These animals deserve all the care we can give them.', 41.8781, -87.6298, true);
    END IF;
    
    -- Update smile counts for these tasks
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task1_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task2_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task3_id;
    
    -- Insert sample delight points for these stories
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
    WHERE ds.is_approved = true
    AND NOT EXISTS (SELECT 1 FROM delight_points dp WHERE dp.story_id = ds.id);
    
END $$;

-- Create a profiles table if it doesn't exist and add sample profile
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample profile data for our demo user
INSERT INTO profiles (id, full_name, email) VALUES
('00000000-0000-0000-0000-000000000001', 'Sarah Johnson', 'sarah.johnson@example.com')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Add RLS policies for profiles table (only if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add RLS policies for delight tables to allow public read access
-- Only enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'delight_tasks' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE delight_tasks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'delight_stories' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE delight_stories ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'delight_smiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE delight_smiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'delight_points' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE delight_points ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public can view delight tasks" ON delight_tasks;
DROP POLICY IF EXISTS "Public can view delight stories" ON delight_stories;
DROP POLICY IF EXISTS "Public can view delight smiles" ON delight_smiles;
DROP POLICY IF EXISTS "Public can view delight points" ON delight_points;
DROP POLICY IF EXISTS "Authenticated users can insert stories" ON delight_stories;
DROP POLICY IF EXISTS "Authenticated users can insert points" ON delight_points;
DROP POLICY IF EXISTS "Authenticated users can update smiles" ON delight_smiles;

-- Allow public read access to delight tasks
CREATE POLICY "Public can view delight tasks" ON delight_tasks
  FOR SELECT USING (true);

-- Allow public read access to delight stories
CREATE POLICY "Public can view delight stories" ON delight_stories
  FOR SELECT USING (true);

-- Allow public read access to delight smiles
CREATE POLICY "Public can view delight smiles" ON delight_smiles
  FOR SELECT USING (true);

-- Allow public read access to delight points
CREATE POLICY "Public can view delight points" ON delight_points
  FOR SELECT USING (true);

-- Allow authenticated users to insert stories
CREATE POLICY "Authenticated users can insert stories" ON delight_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert points
CREATE POLICY "Authenticated users can insert points" ON delight_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update smiles
CREATE POLICY "Authenticated users can update smiles" ON delight_smiles
  FOR UPDATE USING (true);
