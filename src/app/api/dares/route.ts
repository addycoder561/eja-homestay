import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vibe = searchParams.get('vibe');
    const section = searchParams.get('section') || 'trending';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await getSupabaseServer();

    let query;
    
    switch (section) {
      case 'trending':
        const { data: trendingData, error: trendingError } = await supabase
          .rpc('get_trending_dares', { limit_count: limit });
        
        if (trendingError) throw trendingError;
        query = trendingData;
        break;
        
      case 'new':
        query = supabase
          .from('dares')
          .select(`
            *,
            creator:profiles!creator_id(full_name, avatar_url),
            dare_stats!inner(*)
          `)
          .eq('is_active', true)
          .gt('expiry_date', new Date().toISOString())
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        break;
        
      case 'expiring':
        const { data: expiringData, error: expiringError } = await supabase
          .rpc('get_expiring_dares', { hours_ahead: 24 });
        
        if (expiringError) throw expiringError;
        query = expiringData;
        break;
        
      default:
        query = supabase
          .from('dares')
          .select(`
            *,
            creator:profiles!creator_id(full_name, avatar_url),
            dare_stats!inner(*)
          `)
          .eq('is_active', true)
          .gt('expiry_date', new Date().toISOString())
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
    }

    if (section !== 'trending' && section !== 'expiring') {
      if (vibe) {
        query = query.eq('vibe', vibe);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      query = data;
    }

    return NextResponse.json({ dares: query });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching dares:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch dares' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, hashtag, vibe, expiry_date } = body;

    // Validate required fields
    if (!title || !description || !vibe || !expiry_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate vibe
    const validVibes = ['Happy', 'Chill', 'Bold', 'Social'];
    if (!validVibes.includes(vibe)) {
      return NextResponse.json(
        { error: 'Invalid vibe' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create the dare
    const { data, error } = await supabase
      .from('dares')
      .insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim(),
        hashtag: hashtag?.trim() || null,
        vibe,
        expiry_date: new Date(expiry_date).toISOString()
      })
      .select(`
        *,
        creator:profiles!creator_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating dare:', error);
      }
      return NextResponse.json(
        { error: 'Failed to create dare' },
        { status: 500 }
      );
    }

    return NextResponse.json({ dare: data });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating dare:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
