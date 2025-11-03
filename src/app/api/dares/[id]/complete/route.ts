import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { media_urls, caption, location } = body;

    // Validate required fields
    if (!media_urls || !Array.isArray(media_urls) || media_urls.length === 0) {
      return NextResponse.json(
        { error: 'Media URLs are required' },
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

    // Check if dare exists and is still active
    const { data: dare, error: dareError } = await supabase
      .from('dares')
      .select('id, expiry_date')
      .eq('id', params.id)
      .eq('is_active', true)
      .gt('expiry_date', new Date().toISOString())
      .single();

    if (dareError || !dare) {
      return NextResponse.json(
        { error: 'Dare not found or expired' },
        { status: 404 }
      );
    }

    // Check if user has already completed this dare
    const { data: existingCompletion, error: checkError } = await supabase
      .from('completed_dares')
      .select('id')
      .eq('dare_id', params.id)
      .eq('completer_id', user.id)
      .eq('is_active', true)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error checking existing completion:', checkError);
      }
      return NextResponse.json(
        { error: 'Failed to check existing completion' },
        { status: 500 }
      );
    }

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'You have already completed this dare' },
        { status: 400 }
      );
    }

    // Create the completed dare
    const { data, error } = await supabase
      .from('completed_dares')
      .insert({
        dare_id: params.id,
        completer_id: user.id,
        media_urls,
        caption: caption?.trim() || null,
        location: location?.trim() || null
      })
      .select(`
        *,
        completer:profiles!completer_id(full_name, avatar_url),
        dare:dares!dare_id(title, description, hashtag, vibe)
      `)
      .single();

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error creating completed dare:', error);
      }
      return NextResponse.json(
        { error: 'Failed to complete dare' },
        { status: 500 }
      );
    }

    return NextResponse.json({ completed_dare: data });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error completing dare:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
