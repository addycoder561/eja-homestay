import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dare_id, completed_dare_id, engagement_type, content } = body;

    // Validate required fields
    if (!engagement_type) {
      return NextResponse.json(
        { error: 'Engagement type is required' },
        { status: 400 }
      );
    }

    const validTypes = ['smile', 'comment', 'share', 'tag'];
    if (!validTypes.includes(engagement_type)) {
      return NextResponse.json(
        { error: 'Invalid engagement type' },
        { status: 400 }
      );
    }

    // Must have either dare_id or completed_dare_id, but not both
    if ((!dare_id && !completed_dare_id) || (dare_id && completed_dare_id)) {
      return NextResponse.json(
        { error: 'Must specify either dare_id or completed_dare_id' },
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

    // Check if engagement already exists
    let existingEngagement;
    if (dare_id) {
      const { data, error } = await supabase
        .from('dare_engagements')
        .select('id')
        .eq('user_id', user.id)
        .eq('dare_id', dare_id)
        .eq('engagement_type', engagement_type)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error checking existing engagement:', error);
        }
        return NextResponse.json(
          { error: 'Failed to check existing engagement' },
          { status: 500 }
        );
      }
      existingEngagement = data;
    } else {
      const { data, error } = await supabase
        .from('dare_engagements')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed_dare_id', completed_dare_id)
        .eq('engagement_type', engagement_type)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error checking existing engagement:', error);
        }
        return NextResponse.json(
          { error: 'Failed to check existing engagement' },
          { status: 500 }
        );
      }
      existingEngagement = data;
    }

    if (existingEngagement) {
      return NextResponse.json(
        { error: 'Engagement already exists' },
        { status: 400 }
      );
    }

    // Create the engagement
    const engagementData: any = {
      user_id: user.id,
      engagement_type,
      content: content?.trim() || null
    };

    if (dare_id) {
      engagementData.dare_id = dare_id;
    } else {
      engagementData.completed_dare_id = completed_dare_id;
    }

    const { data, error } = await supabase
      .from('dare_engagements')
      .insert(engagementData)
      .select(`
        *,
        user:profiles!user_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating engagement:', error);
      }
      return NextResponse.json(
        { error: 'Failed to create engagement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ engagement: data });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating engagement:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dare_id = searchParams.get('dare_id');
    const completed_dare_id = searchParams.get('completed_dare_id');
    const engagement_type = searchParams.get('engagement_type');

    if (!engagement_type) {
      return NextResponse.json(
        { error: 'Engagement type is required' },
        { status: 400 }
      );
    }

    if ((!dare_id && !completed_dare_id) || (dare_id && completed_dare_id)) {
      return NextResponse.json(
        { error: 'Must specify either dare_id or completed_dare_id' },
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

    // Delete the engagement
    let deleteQuery = supabase
      .from('dare_engagements')
      .delete()
      .eq('user_id', user.id)
      .eq('engagement_type', engagement_type);

    if (dare_id) {
      deleteQuery = deleteQuery.eq('dare_id', dare_id);
    } else {
      deleteQuery = deleteQuery.eq('completed_dare_id', completed_dare_id);
    }

    const { error } = await deleteQuery;

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error deleting engagement:', error);
      }
      return NextResponse.json(
        { error: 'Failed to delete engagement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting engagement:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}