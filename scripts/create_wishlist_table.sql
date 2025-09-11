-- Create wishlist table for saving properties, experiences, and retreats
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'experience', 'retreat')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, item_id, item_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_id ON public.wishlist(item_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_type ON public.wishlist(item_type);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_item ON public.wishlist(user_id, item_id, item_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;

-- Test the table creation
SELECT 'Wishlist table created successfully' as status;
