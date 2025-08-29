-- Populate sample delight stories and points data
-- This will create some sample stories to demonstrate the feature

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
    
    -- Create a sample user in auth.users if it doesn't exist
    -- We'll use a simple approach by checking if any user exists and using that
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
    
    -- If no users exist, we'll skip the sample data for now
    -- In a real scenario, you would create a proper user first
    IF sample_user_id IS NOT NULL THEN
        -- Insert sample delight stories
        INSERT INTO delight_stories (task_id, user_id, proof_media, proof_text, latitude, longitude, is_approved) VALUES
        (task1_id, sample_user_id, 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80', 'Just planted a beautiful oak tree in our community park! The sapling is healthy and ready to grow. This will provide shade and oxygen for generations to come.', 40.7128, -74.0060, true),
        (task2_id, sample_user_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Spent 3 hours cleaning up the local beach today. Collected 15 bags of trash including plastic bottles, fishing nets, and other debris. The beach looks much cleaner now!', 34.0522, -118.2437, true),
        (task3_id, sample_user_id, 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80', 'Volunteered at the local animal shelter today. Fed the dogs, cleaned their kennels, and gave them some much-needed love and attention. These animals deserve all the care we can give them.', 41.8781, -87.6298, true);
        
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
        WHERE ds.is_approved = true;
    END IF;
    
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

-- Insert sample profile data for existing users (if any)
INSERT INTO profiles (id, full_name, email) 
SELECT 
    id,
    'Sarah Johnson',
    email
FROM auth.users 
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Add RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
