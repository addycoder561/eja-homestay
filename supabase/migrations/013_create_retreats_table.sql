-- Create retreats table for wellness and themed retreats
CREATE TABLE public.retreats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  categories TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[],
  cover_image TEXT,
  duration TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for host_id
CREATE INDEX idx_retreats_host_id ON public.retreats(host_id);

-- Index for active retreats
CREATE INDEX idx_retreats_active ON public.retreats(is_active);

-- Enable RLS
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Retreats are viewable by everyone" ON public.retreats
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert their own retreats" ON public.retreats
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their own retreats" ON public.retreats
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own retreats" ON public.retreats
  FOR DELETE USING (auth.uid() = host_id);
