-- Database Setup for EJA Homestay
-- Run this in Supabase SQL Editor

-- 1. Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('experience', 'retreat')),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('wow', 'care')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- 2. Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 3. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up RLS (Row Level Security) policies

-- Reactions table policies
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reactions
CREATE POLICY "Users can insert their own reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions
CREATE POLICY "Users can update their own reactions" ON reactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Users can view all reactions
CREATE POLICY "Users can view all reactions" ON reactions
  FOR SELECT USING (true);

-- Follows table policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can insert their own follows
CREATE POLICY "Users can insert their own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Users can view all follows
CREATE POLICY "Users can view all follows" ON follows
  FOR SELECT USING (true);

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_item_id ON reactions(item_id);
CREATE INDEX IF NOT EXISTS idx_reactions_item_type ON reactions(item_type);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- 6. Create views for reaction stats
CREATE OR REPLACE VIEW reaction_stats AS
SELECT 
  item_id,
  item_type,
  COUNT(*) as total_reactions,
  COUNT(*) FILTER (WHERE reaction_type = 'wow') as wow_count,
  COUNT(*) FILTER (WHERE reaction_type = 'care') as care_count
FROM reactions
GROUP BY item_id, item_type;

-- 7. Create views for user social stats
CREATE OR REPLACE VIEW user_social_stats AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT f1.id) as follower_count,
  COUNT(DISTINCT f2.id) as following_count,
  COUNT(DISTINCT r.id) as reaction_count
FROM auth.users u
LEFT JOIN follows f1 ON u.id = f1.following_id
LEFT JOIN follows f2 ON u.id = f2.follower_id
LEFT JOIN reactions r ON u.id = r.user_id
GROUP BY u.id;

-- 8. Grant necessary permissions
GRANT ALL ON reactions TO authenticated;
GRANT ALL ON follows TO authenticated;
GRANT ALL ON reaction_stats TO authenticated;
GRANT ALL ON user_social_stats TO authenticated;
