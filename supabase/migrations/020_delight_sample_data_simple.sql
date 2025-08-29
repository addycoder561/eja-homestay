-- Simple approach: Add sample data that doesn't require existing users
-- This will create sample stories and points that can be used for demonstration

-- First, let's get some task IDs to reference
DO $$
DECLARE
    task1_id UUID;
    task2_id UUID;
    task3_id UUID;
BEGIN
    -- Get task IDs
    SELECT id INTO task1_id FROM delight_tasks WHERE title = 'Plant a Tree' LIMIT 1;
    SELECT id INTO task2_id FROM delight_tasks WHERE title = 'Clean a Beach' LIMIT 1;
    SELECT id INTO task3_id FROM delight_tasks WHERE title = 'Help Animals' LIMIT 1;
    
    -- Update smile counts for these tasks to show some activity
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task1_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task2_id;
    UPDATE delight_smiles SET smile_count = 1 WHERE task_id = task3_id;
    
END $$;

-- Create a profiles table if it doesn't exist (for user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
