import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getProfile } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API called');
    
    const supabase = getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 Auth user:', user);
    console.log('🔍 Auth error:', authError);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get profile data
    const profile = await getProfile(user.id);
    console.log('🔍 Profile data:', profile);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at
      },
      profile: profile
    });

  } catch (error) {
    console.error('🔍 Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
