import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await getSupabaseServer();

    // 1) Fetch completed dares with basic joins
    const { data: baseCompleted, error: baseError } = await supabase
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

    const completed = baseCompleted || [];
    if (completed.length === 0) {
      return NextResponse.json({ completed_dares: [] });
    }

    // 2) Aggregate engagement counts for these completed dare IDs
    const completedIds = completed.map((cd: any) => cd.id);

    const { data: engagements, error: engagementsError } = await supabase
      .from('dare_engagements')
      .select('completed_dare_id, engagement_type')
      .in('completed_dare_id', completedIds);

    if (engagementsError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching engagement aggregates:', engagementsError);
      }
      // Continue without counts rather than failing the entire request
    }

    const countsByCompleted: Record<string, { smile_count: number; comment_count: number; share_count: number; }> = {};
    for (const id of completedIds) {
      countsByCompleted[id] = { smile_count: 0, comment_count: 0, share_count: 0 };
    }

    if (engagements) {
      for (const e of engagements as Array<{ completed_dare_id: string | null; engagement_type: string }>) {
        if (!e.completed_dare_id) continue;
        const bucket = countsByCompleted[e.completed_dare_id];
        if (!bucket) continue;
        if (e.engagement_type === 'smile') bucket.smile_count += 1;
        else if (e.engagement_type === 'comment') bucket.comment_count += 1;
        else if (e.engagement_type === 'share') bucket.share_count += 1;
      }
    }

    // 3) Merge counts into the response shape
    const response = completed.map((cd: any) => ({
      ...cd,
      smile_count: countsByCompleted[cd.id]?.smile_count ?? 0,
      comment_count: countsByCompleted[cd.id]?.comment_count ?? 0,
      share_count: countsByCompleted[cd.id]?.share_count ?? 0,
    }));

    return NextResponse.json({ completed_dares: response });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in completed dares route:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
