'use client';

import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import { getProfile } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: 'guest') => Promise<{ error: Error | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  onAuthSuccess: (callback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const authSuccessCallbacksRef = useRef<(() => void)[]>([]);
  const lastAuthenticatedRef = useRef<boolean>(false);

  const onAuthSuccess = (callback: () => void) => {
    authSuccessCallbacksRef.current.push(callback);
  };

  useEffect(() => {
    let isMounted = true;

    // Always try to initialize auth - let Supabase handle configuration errors

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthenticated = !!session?.user;
        lastAuthenticatedRef.current = isAuthenticated;
        if (!isMounted) return;
        setUser(session?.user ?? null);
        if (session?.user) {
          const userProfile = await getProfile(session.user.id);
          if (!isMounted) return;
          setProfile(userProfile);
        }
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          const wasAuthenticated = lastAuthenticatedRef.current;
          const isNowAuthenticated = !!session?.user;
          lastAuthenticatedRef.current = isNowAuthenticated;

          setUser(session?.user ?? null);

          if (session?.user) {
            const userProfile = await getProfile(session.user.id);
            setProfile(userProfile);
            if (!wasAuthenticated && isNowAuthenticated) {
              const callbacks = authSuccessCallbacksRef.current.splice(0);
              callbacks.forEach((cb) => {
                try { cb(); } catch (err) { console.error('Error executing auth success callback:', err); }
              });
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error in auth state change:', error);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'guest') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: fullName.split(' ')[0],
          role,
        },
      },
    });
    if (!error) {
      // Auto-login after signup
      await signIn(email, password);
    }
    return { error };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    const updatedProfile = await getProfile(user.id);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    onAuthSuccess,
  }), [user, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 