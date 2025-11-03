// Dare expiry and completion logic
import { getSupabaseServer } from './supabase-server';

export interface DareExpiryConfig {
  dareExpiryDays: number;
  lowEngagementDays: number;
  completionLowSmilesDays: number;
  minCompletions: number;
  minSmiles: number;
}

export const DEFAULT_DARE_CONFIG: DareExpiryConfig = {
  dareExpiryDays: 3,
  lowEngagementDays: 7,
  completionLowSmilesDays: 3,
  minCompletions: 10,
  minSmiles: 10
};

/**
 * Clean up expired dares and low-engagement content
 * This function should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredDares(): Promise<{
  expiredDares: number;
  lowEngagementDares: number;
  lowSmilesCompletions: number;
}> {
  try {
    const supabase = await getSupabaseServer();
    
    // Call the database function to clean up expired dares
    const { data, error } = await supabase.rpc('cleanup_expired_dares');
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error cleaning up expired dares:', error);
      }
      throw error;
    }
    
    return {
      expiredDares: data || 0,
      lowEngagementDares: 0, // The function handles both
      lowSmilesCompletions: 0 // The function handles both
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in cleanupExpiredDares:', error);
    }
    throw error;
  }
}

/**
 * Check if a dare is expiring soon (within 24 hours)
 */
export function isDareExpiringSoon(expiryDate: string): boolean {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
}

/**
 * Check if a dare has expired
 */
export function isDareExpired(expiryDate: string): boolean {
  const now = new Date();
  const expiry = new Date(expiryDate);
  
  return expiry <= now;
}

/**
 * Get time remaining until dare expires
 */
export function getDareTimeRemaining(expiryDate: string): {
  hours: number;
  minutes: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
} {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      isExpired: true,
      isExpiringSoon: false
    };
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const isExpiringSoon = hours <= 24;
  
  return {
    hours,
    minutes,
    isExpired: false,
    isExpiringSoon
  };
}

/**
 * Format time remaining for display
 */
export function formatDareTimeRemaining(expiryDate: string): string {
  const timeRemaining = getDareTimeRemaining(expiryDate);
  
  if (timeRemaining.isExpired) {
    return 'Expired';
  }
  
  if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m left`;
  } else {
    return `${timeRemaining.minutes}m left`;
  }
}

/**
 * Check if a completed dare should be hidden due to low engagement
 */
export async function shouldHideCompletedDare(
  completedDareId: string,
  config: DareExpiryConfig = DEFAULT_DARE_CONFIG
): Promise<boolean> {
  try {
    const supabase = await getSupabaseServer();
    
    // Get the completed dare with its stats
    const { data: completedDare, error } = await supabase
      .from('completed_dares')
      .select(`
        id,
        created_at,
        completed_dare_stats!inner(smile_count)
      `)
      .eq('id', completedDareId)
      .eq('is_active', true)
      .single();
    
    if (error || !completedDare) {
      return false;
    }
    
    const createdAt = new Date(completedDare.created_at);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Check if it's been more than the threshold days and has low smiles
    if (daysSinceCreation >= config.completionLowSmilesDays) {
      const smileCount = completedDare.completed_dare_stats?.smile_count || 0;
      return smileCount < config.minSmiles;
    }
    
    return false;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error checking if completed dare should be hidden:', error);
    }
    return false;
  }
}

/**
 * Check if a dare should be hidden due to low completion count
 */
export async function shouldHideDare(
  dareId: string,
  config: DareExpiryConfig = DEFAULT_DARE_CONFIG
): Promise<boolean> {
  try {
    const supabase = await getSupabaseServer();
    
    // Get the dare with its stats
    const { data: dare, error } = await supabase
      .from('dares')
      .select(`
        id,
        expiry_date,
        dare_stats!inner(completion_count)
      `)
      .eq('id', dareId)
      .eq('is_active', true)
      .single();
    
    if (error || !dare) {
      return false;
    }
    
    const expiryDate = new Date(dare.expiry_date);
    const now = new Date();
    const daysSinceExpiry = (now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Check if it's been more than the threshold days since expiry and has low completions
    if (daysSinceExpiry >= config.lowEngagementDays) {
      const completionCount = dare.dare_stats?.completion_count || 0;
      return completionCount < config.minCompletions;
    }
    
    return false;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error checking if dare should be hidden:', error);
    }
    return false;
  }
}

/**
 * Get dares that are expiring soon
 */
export async function getExpiringDares(hoursAhead: number = 24): Promise<any[]> {
  try {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase.rpc('get_expiring_dares', {
      hours_ahead: hoursAhead
    });
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching expiring dares:', error);
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in getExpiringDares:', error);
    }
    throw error;
  }
}

/**
 * Get trending dares based on engagement
 */
export async function getTrendingDares(limit: number = 20): Promise<any[]> {
  try {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase.rpc('get_trending_dares', {
      limit_count: limit
    });
    
    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching trending dares:', error);
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in getTrendingDares:', error);
    }
    throw error;
  }
}

/**
 * Schedule cleanup task (for use in API routes or cron jobs)
 */
export async function scheduleDareCleanup(): Promise<void> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🧹 Starting dare cleanup task...');
    }
    
    const result = await cleanupExpiredDares();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Dare cleanup completed:', {
        expiredDares: result.expiredDares,
        lowEngagementDares: result.lowEngagementDares,
        lowSmilesCompletions: result.lowSmilesCompletions
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error in scheduled dare cleanup:', error);
    }
  }
}
