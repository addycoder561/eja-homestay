-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('create', 'retreat', 'campaign')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for collaborations table
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert collaborations (for the form submission)
CREATE POLICY "Allow public insert on collaborations" ON public.collaborations
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view collaborations (for admin dashboard)
CREATE POLICY "Allow authenticated users to view collaborations" ON public.collaborations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON public.collaborations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 