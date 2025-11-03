import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const completed_dare_id = searchParams.get('completed_dare_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!completed_dare_id) {
      return NextResponse.json({ error: 'completed_dare_id is required' }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from('dare_engagements')
      .select(`
        id,
        user_id,
        completed_dare_id,
        engagement_type,
        content,
        created_at,
        author:profiles!user_id(full_name, avatar_url)
      `)
      .eq('completed_dare_id', completed_dare_id)
      .eq('engagement_type', 'comment')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching comments:', error);
      }
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error in comments list route:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


