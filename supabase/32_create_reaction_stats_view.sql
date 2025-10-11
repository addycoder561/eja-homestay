-- Create view for reaction statistics
CREATE OR REPLACE VIEW public.reaction_stats AS
SELECT 
    item_id,
    item_type,
    COUNT(*) as total_reactions,
    COUNT(*) FILTER (WHERE reaction_type = 'wow') as wow_count,
    COUNT(*) FILTER (WHERE reaction_type = 'care') as care_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.reactions
GROUP BY item_id, item_type;

-- Create view for user reaction summary
CREATE OR REPLACE VIEW public.user_reaction_summary AS
SELECT 
    r.user_id,
    r.item_id,
    r.item_type,
    r.reaction_type,
    r.created_at,
    rs.total_reactions,
    rs.wow_count,
    rs.care_count
FROM public.reactions r
LEFT JOIN public.reaction_stats rs ON r.item_id = rs.item_id AND r.item_type = rs.item_type;

-- Create view for follow statistics
CREATE OR REPLACE VIEW public.follow_stats AS
SELECT 
    following_id as user_id,
    COUNT(*) as follower_count,
    ARRAY_AGG(follower_id) as follower_ids
FROM public.follows
GROUP BY following_id;

-- Create view for following statistics  
CREATE OR REPLACE VIEW public.following_stats AS
SELECT 
    follower_id as user_id,
    COUNT(*) as following_count,
    ARRAY_AGG(following_id) as following_ids
FROM public.follows
GROUP BY follower_id;

-- Create comprehensive user stats view
CREATE OR REPLACE VIEW public.user_social_stats AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    COALESCE(fs.follower_count, 0) as follower_count,
    COALESCE(fing.following_count, 0) as following_count,
    COALESCE(fs.follower_ids, ARRAY[]::UUID[]) as follower_ids,
    COALESCE(fing.following_ids, ARRAY[]::UUID[]) as following_ids
FROM public.profiles p
LEFT JOIN public.follow_stats fs ON p.id = fs.user_id
LEFT JOIN public.following_stats fing ON p.id = fing.user_id;
