-- Create experiences table for travel/activity experiences
CREATE TABLE public.experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL,
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for host_id
CREATE INDEX idx_experiences_host_id ON public.experiences(host_id); 