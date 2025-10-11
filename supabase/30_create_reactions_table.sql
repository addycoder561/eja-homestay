-- Create reactions table for experience/retreat reactions
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL, -- Can be experience_id or retreat_id
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('experience', 'retreat')),
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('wow', 'care')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one reaction per user per item
    UNIQUE(user_id, item_id, item_type)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_item ON public.reactions(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON public.reactions(reaction_type);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all reactions" ON public.reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" ON public.reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON public.reactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_reactions_updated_at
    BEFORE UPDATE ON public.reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_reactions_updated_at();
