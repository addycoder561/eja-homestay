-- Migration: Add engagement features (likes, shares, testimonials, collaborations)
-- This migration adds tables for tracking user engagement and interactions

-- Create likes table
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'experience', 'retreat')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

-- Create shares table
CREATE TABLE public.shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'experience', 'retreat')),
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'whatsapp', 'telegram', 'copy_link')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'experience', 'retreat')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaborations table (new version for card collaborations)
CREATE TABLE public.card_collaborations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'experience', 'retreat')),
  collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('reel', 'co_host')),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  user_instagram TEXT,
  user_youtube TEXT,
  user_tiktok TEXT,
  proposal TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  host_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for likes table
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert/delete their own likes
CREATE POLICY "Users can manage their own likes" ON public.likes
  FOR ALL USING (auth.uid() = user_id);

-- Allow public read access to likes count
CREATE POLICY "Public can view likes" ON public.likes
  FOR SELECT USING (true);

-- Add RLS policies for shares table
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert shares
CREATE POLICY "Users can insert shares" ON public.shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read access to shares
CREATE POLICY "Public can view shares" ON public.shares
  FOR SELECT USING (true);

-- Add RLS policies for testimonials table
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own testimonials
CREATE POLICY "Users can insert their own testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own testimonials
CREATE POLICY "Users can update their own testimonials" ON public.testimonials
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access to testimonials
CREATE POLICY "Public can view testimonials" ON public.testimonials
  FOR SELECT USING (true);

-- Add RLS policies for card_collaborations table
ALTER TABLE public.card_collaborations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert collaborations
CREATE POLICY "Users can insert collaborations" ON public.card_collaborations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own collaborations
CREATE POLICY "Users can view their own collaborations" ON public.card_collaborations
  FOR SELECT USING (auth.uid() = user_id);

-- Allow hosts/admins to view collaborations for their items
CREATE POLICY "Hosts can view item collaborations" ON public.card_collaborations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@eja.com'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_likes_item ON public.likes(item_id, item_type);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_shares_item ON public.shares(item_id, item_type);
CREATE INDEX idx_shares_user ON public.shares(user_id);
CREATE INDEX idx_testimonials_item ON public.testimonials(item_id, item_type);
CREATE INDEX idx_testimonials_user ON public.testimonials(user_id);
CREATE INDEX idx_testimonials_rating ON public.testimonials(rating);
CREATE INDEX idx_card_collaborations_item ON public.card_collaborations(item_id, item_type);
CREATE INDEX idx_card_collaborations_user ON public.card_collaborations(user_id);
CREATE INDEX idx_card_collaborations_status ON public.card_collaborations(status);

-- Create updated_at trigger for testimonials and collaborations
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_collaborations_updated_at BEFORE UPDATE ON public.card_collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
