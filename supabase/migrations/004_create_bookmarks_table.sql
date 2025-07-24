-- Bookmarks table for properties, experiences, and trips
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('property', 'experience', 'trip')),
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE (user_id, item_id, item_type)
); 