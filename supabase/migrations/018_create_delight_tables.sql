-- Create delight_tasks table
CREATE TABLE IF NOT EXISTS delight_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image VARCHAR(500),
  location VARCHAR(255),
  duration_minutes INTEGER DEFAULT 60,
  category VARCHAR(100) DEFAULT 'general',
  base_points INTEGER DEFAULT 1500,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delight_stories table
CREATE TABLE IF NOT EXISTS delight_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES delight_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  proof_media VARCHAR(500) NOT NULL,
  proof_text TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delight_smiles table
CREATE TABLE IF NOT EXISTS delight_smiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES delight_tasks(id) ON DELETE CASCADE,
  smile_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delight_points table
CREATE TABLE IF NOT EXISTS delight_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES delight_tasks(id) ON DELETE CASCADE,
  story_id UUID REFERENCES delight_stories(id) ON DELETE CASCADE,
  base_points INTEGER DEFAULT 1500,
  doubled_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 1500,
  is_doubled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delight_tasks_category ON delight_tasks(category);
CREATE INDEX IF NOT EXISTS idx_delight_tasks_active ON delight_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_delight_stories_task_id ON delight_stories(task_id);
CREATE INDEX IF NOT EXISTS idx_delight_stories_user_id ON delight_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_delight_stories_created_at ON delight_stories(created_at);
CREATE INDEX IF NOT EXISTS idx_delight_smiles_task_id ON delight_smiles(task_id);
CREATE INDEX IF NOT EXISTS idx_delight_points_user_id ON delight_points(user_id);
CREATE INDEX IF NOT EXISTS idx_delight_points_task_id ON delight_points(task_id);

-- Insert sample delight tasks
INSERT INTO delight_tasks (title, subtitle, description, cover_image, location, duration_minutes, category, base_points) VALUES
('Plant a Tree', 'Help the environment one tree at a time', 'Plant a native tree in your community and watch it grow. Take a photo with your newly planted tree.', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80', 'Your Community', 120, 'environment', 1500),
('Feed the Homeless', 'Share a meal with someone in need', 'Prepare or buy a meal and share it with someone who needs it. Document the act of kindness.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80', 'Local Shelters', 90, 'community', 1500),
('Clean a Beach', 'Keep our oceans beautiful', 'Spend time cleaning up a local beach or water body. Collect and properly dispose of trash.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 'Local Beaches', 180, 'environment', 1500),
('Visit Elderly', 'Brighten someone''s day', 'Visit an elderly person in your neighborhood or a nursing home. Share stories and companionship.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', 'Nursing Homes', 60, 'community', 1500),
('Donate Blood', 'Save lives with your donation', 'Donate blood at a local blood bank. This simple act can save multiple lives.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80', 'Blood Banks', 45, 'health', 1500),
('Teach Someone', 'Share your knowledge', 'Teach someone a skill you know - cooking, coding, music, or any other skill. Help them grow.', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', 'Anywhere', 120, 'education', 1500),
('Help Animals', 'Care for our furry friends', 'Volunteer at an animal shelter, feed stray animals, or help injured animals.', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80', 'Animal Shelters', 90, 'animals', 1500),
('Recycle Drive', 'Organize a recycling initiative', 'Organize a recycling drive in your community. Collect recyclables and ensure proper disposal.', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80', 'Your Community', 240, 'environment', 1500),
('Random Acts', 'Spread kindness randomly', 'Perform 5 random acts of kindness in a day. Hold doors, help carry bags, compliment strangers.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', 'Anywhere', 60, 'kindness', 1500),
('Support Local', 'Buy from local businesses', 'Support local businesses by buying from them instead of big chains. Help your community thrive.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80', 'Local Markets', 90, 'community', 1500);

-- Initialize smile counts for all tasks
INSERT INTO delight_smiles (task_id, smile_count) 
SELECT id, 0 FROM delight_tasks;
