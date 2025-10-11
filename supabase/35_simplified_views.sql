-- Drop dependent views first (in correct order)
DROP VIEW IF EXISTS public.user_social_stats CASCADE;
DROP VIEW IF EXISTS public.follow_stats CASCADE;
DROP VIEW IF EXISTS public.following_stats CASCADE;
DROP VIEW IF EXISTS public.user_reaction_summary CASCADE;

-- Keep only essential views

-- 1. Reaction statistics for experiences/retreats
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

-- 2. User social statistics (followers/following)
CREATE OR REPLACE VIEW public.user_social_stats AS
SELECT 
    p.id as user_id,
    COALESCE(follower_counts.follower_count, 0) as follower_count,
    COALESCE(following_counts.following_count, 0) as following_count
FROM public.profiles p
LEFT JOIN (
    SELECT following_id, COUNT(*) as follower_count
    FROM public.follows
    GROUP BY following_id
) follower_counts ON p.id = follower_counts.following_id
LEFT JOIN (
    SELECT follower_id, COUNT(*) as following_count
    FROM public.follows
    GROUP BY follower_id
) following_counts ON p.id = following_counts.follower_id;
