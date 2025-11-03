import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from('dares')
      .select(`
        *,
        creator:profiles!creator_id(full_name, avatar_url),
        dare_stats!inner(*),
        completed_dares(
          *,
          completer:profiles!completer_id(full_name, avatar_url),
          completed_dare_stats!inner(*)
        )
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching dare:', error);
      }
      return NextResponse.json(
        { error: 'Dare not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dare: data });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching dare:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is the creator of the dare
    const { data: dare, error: fetchError } = await supabase
      .from('dares')
      .select('creator_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !dare) {
      return NextResponse.json(
        { error: 'Dare not found' },
        { status: 404 }
      );
    }

    if (dare.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete the dare
    const { error: deleteError } = await supabase
      .from('dares')
      .update({ is_active: false })
      .eq('id', params.id);

    if (deleteError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error deleting dare:', deleteError);
      }
      return NextResponse.json(
        { error: 'Failed to delete dare' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error deleting dare:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
