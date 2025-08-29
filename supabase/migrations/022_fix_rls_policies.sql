-- Fix RLS policies for delight tables
-- This will allow public read access to delight data

-- First, let's check if RLS is enabled and drop existing policies
DO $$
BEGIN
    -- Disable RLS temporarily to allow public access
    ALTER TABLE delight_tasks DISABLE ROW LEVEL SECURITY;
    ALTER TABLE delight_stories DISABLE ROW LEVEL SECURITY;
    ALTER TABLE delight_smiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE delight_points DISABLE ROW LEVEL SECURITY;
    
    -- Also disable RLS on profiles for public read access
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'RLS disabled on all delight tables for public access';
END $$;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public can view delight tasks" ON delight_tasks;
DROP POLICY IF EXISTS "Public can view delight stories" ON delight_stories;
DROP POLICY IF EXISTS "Public can view delight smiles" ON delight_smiles;
DROP POLICY IF EXISTS "Public can view delight points" ON delight_points;
DROP POLICY IF EXISTS "Authenticated users can insert stories" ON delight_stories;
DROP POLICY IF EXISTS "Authenticated users can insert points" ON delight_points;
DROP POLICY IF EXISTS "Authenticated users can update smiles" ON delight_smiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simple public read policies
CREATE POLICY "Public can view delight tasks" ON delight_tasks
  FOR SELECT USING (true);

CREATE POLICY "Public can view delight stories" ON delight_stories
  FOR SELECT USING (true);

CREATE POLICY "Public can view delight smiles" ON delight_smiles
  FOR SELECT USING (true);

CREATE POLICY "Public can view delight points" ON delight_points
  FOR SELECT USING (true);

CREATE POLICY "Public can view profiles" ON profiles
  FOR SELECT USING (true);

-- Create insert policies for authenticated users
CREATE POLICY "Authenticated users can insert stories" ON delight_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert points" ON delight_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update smiles" ON delight_smiles
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Re-enable RLS with the new policies
DO $$
BEGIN
    ALTER TABLE delight_tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE delight_stories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE delight_smiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE delight_points ENABLE ROW LEVEL SECURITY;
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'RLS re-enabled with public read access policies';
END $$;
