import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dareId } = await params;
    const body = await request.json();
    const { media_urls, caption, location } = body;

    // Validate required fields
    if (!media_urls || !Array.isArray(media_urls) || media_urls.length === 0) {
      return NextResponse.json(
        { error: 'Media URLs are required' },
        { status: 400 }
      );
    }

    // Get auth token from Authorization header if cookies aren't available
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user = null;
    let authError = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Create an authenticated Supabase client with the token
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      
      // Create client and set session for RLS to work
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Get refresh token from header
      const refreshToken = request.headers.get('x-refresh-token') || '';
      
      // Set the session so RLS policies can access auth.uid()
      if (refreshToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken,
        });
        
        if (sessionError) {
          console.error('Failed to set session:', sessionError);
          authError = sessionError;
        } else {
          user = sessionData?.user || null;
          if (!user) {
            authError = { message: 'Failed to get user from session' } as any;
          }
        }
      } else {
        // Fallback: verify token if no refresh token
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        user = tokenUser;
        authError = tokenError;
      }
    } else {
      // Fallback to cookie-based auth
      supabase = await getSupabaseServer();
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }
    
    if (authError) {
      console.error('Authentication error:', {
        error: authError,
        message: authError.message,
        status: authError.status
      });
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: process.env.NODE_ENV !== 'production' ? authError.message : undefined
        },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error('No user found in authentication');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('Authenticated user:', { id: user.id, email: user.email });

    // Ensure profile exists (required for foreign key constraint)
    const profile = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile.data) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          is_host: false,
        })
        .select('id')
        .single();

      if (profileError || !newProfile) {
        console.error('Failed to create profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to verify profile. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Check if dare exists and is still active
    const { data: dare, error: dareError } = await supabase
      .from('dares')
      .select('id, expiry_date')
      .eq('id', dareId)
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
      .eq('dare_id', dareId)
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
        dare_id: dareId,
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
      console.error('Error creating completed dare:', error);
      return NextResponse.json(
        { 
          error: error.message || 'Failed to complete dare',
          details: process.env.NODE_ENV !== 'production' ? error : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ completed_dare: data });

  } catch (error) {
    console.error('Error completing dare:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
