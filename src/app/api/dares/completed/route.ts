import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await getSupabaseServer();

    // Optimized: Fetch completed dares first, then fetch matching stats
    const { data: completed, error: baseError } = await supabase
      .from('completed_dares')
      .select(`
        *,
        completer:profiles!completer_id(full_name, avatar_url),
        dare:dares!dare_id(
          title,
          description,
          hashtag,
          vibe,
          expiry_date,
          creator:profiles!creator_id(full_name, avatar_url)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (baseError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching completed dares:', baseError);
      }
      return NextResponse.json({ error: 'Failed to fetch completed dares' }, { status: 500 });
    }

    if (!completed || completed.length === 0) {
      return NextResponse.json({ completed_dares: [] });
    }

    // Fetch stats only for the completed dares we fetched (optimized query)
    const completedIds = completed.map((cd: any) => cd.id);
    const { data: statsData } = await supabase
      .from('completed_dare_stats')
      .select('completed_dare_id, smile_count, comment_count, share_count')
      .in('completed_dare_id', completedIds);

    // Create stats map for O(1) lookup
    const statsMap = new Map();
    if (statsData) {
      statsData.forEach((stat: any) => {
        statsMap.set(stat.completed_dare_id, stat);
      });
    }

    // Merge stats into response efficiently
    const response = completed.map((cd: any) => {
      const stats = statsMap.get(cd.id);
      return {
        ...cd,
        smile_count: stats?.smile_count ?? 0,
        comment_count: stats?.comment_count ?? 0,
        share_count: stats?.share_count ?? 0,
      };
    });

    return NextResponse.json({ completed_dares: response });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in completed dares route:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
