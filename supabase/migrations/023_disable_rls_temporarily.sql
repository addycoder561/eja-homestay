-- Temporarily disable RLS to test data access
-- This will allow all operations without restrictions

-- Disable RLS on all delight tables
ALTER TABLE delight_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE delight_stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE delight_smiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE delight_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all policies to ensure no conflicts
DROP POLICY IF EXISTS "Public can view delight tasks" ON delight_tasks;
DROP POLICY IF EXISTS "Public can view delight stories" ON delight_stories;
DROP POLICY IF EXISTS "Public can view delight smiles" ON delight_smiles;
DROP POLICY IF EXISTS "Public can view delight points" ON delight_points;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert stories" ON delight_stories;
DROP POLICY IF EXISTS "Authenticated users can insert points" ON delight_points;
DROP POLICY IF EXISTS "Authenticated users can update smiles" ON delight_smiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
