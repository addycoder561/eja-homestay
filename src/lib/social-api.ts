import { supabase } from './supabase';

// Follow functionality
export async function followUser(followerId: string, followingId: string) {
  try {
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      });

    if (error) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error following user:', error);
    return { success: false, error: 'Failed to follow user' };
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user' };
  }
}

export async function isFollowing(followerId: string, followingId: string) {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking follow status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, isFollowing: !!data };
  } catch (error) {
    console.error('Unexpected error checking follow status:', error);
    return { success: false, error: 'Failed to check follow status' };
  }
}

// Reaction functionality (using dare_engagements table)
export async function addReaction(userId: string, itemId: string, itemType: 'experience' | 'retreat', reactionType: 'wow' | 'care') {
  try {
    // Check if reaction already exists
    const { data: existing } = await supabase
      .from('dare_engagements')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .eq('engagement_type', 'smile')
      .single();

    if (existing) {
      // Update existing engagement with reaction_type
      const { data, error } = await supabase
        .from('dare_engagements')
        .update({
          engagement_value: reactionType
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reaction:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } else {
      // Create new engagement
      const { data, error } = await supabase
        .from('dare_engagements')
        .insert({
          user_id: userId,
          item_id: itemId,
          item_type: itemType,
          engagement_type: 'smile',
          engagement_value: reactionType
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding reaction:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }
  } catch (error) {
    console.error('Unexpected error adding reaction:', error);
    return { success: false, error: 'Failed to add reaction' };
  }
}

export async function removeReaction(userId: string, itemId: string, itemType: 'experience' | 'retreat') {
  try {
    const { error } = await supabase
      .from('dare_engagements')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .eq('engagement_type', 'smile');

    if (error) {
      console.error('Error removing reaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error removing reaction:', error);
    return { success: false, error: 'Failed to remove reaction' };
  }
}

export async function getReactionStats(itemId: string, itemType: 'experience' | 'retreat') {
  try {
    const { data, error } = await supabase
      .from('reactions_stats')
      .select('*')
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .single();

    if (error) {
      console.error('Error getting reaction stats:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error getting reaction stats:', error);
    return { success: false, error: 'Failed to get reaction stats' };
  }
}

export async function getUserSocialStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_social_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting user social stats:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error getting user social stats:', error);
    return { success: false, error: 'Failed to get user social stats' };
  }
}

export async function getUserReactionCount(userId: string) {
  try {
    const { data, error } = await supabase
      .from('dare_engagements')
      .select('id')
      .eq('user_id', userId)
      .eq('engagement_type', 'smile')
      .not('item_id', 'is', null);

    if (error) {
      console.error('Error getting user reaction count:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Unexpected error getting user reaction count:', error);
    return { success: false, error: 'Failed to get user reaction count' };
  }
}
