import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { following_id } = body;

    if (!following_id) {
      return NextResponse.json(
        { error: 'Following ID is required' },
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

    if (user.id === following_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error checking existing follow:', checkError);
      }
      return NextResponse.json(
        { error: 'Failed to check existing follow' },
        { status: 500 }
      );
    }

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create the follow relationship
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id
      })
      .select(`
        *,
        following:profiles!following_id(full_name, avatar_url)
      `)
      .single();

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating follow:', error);
      }
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ follow: data });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating follow:', error);
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
    const following_id = searchParams.get('following_id');

    if (!following_id) {
      return NextResponse.json(
        { error: 'Following ID is required' },
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

    // Delete the follow relationship
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', following_id);

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error deleting follow:', error);
      }
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting follow:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
