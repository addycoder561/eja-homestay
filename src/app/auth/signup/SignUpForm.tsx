"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = 'guest';
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'guest',
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    } else {
      setEmailError('');
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Call Supabase signUp directly to get the full response with session info
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: 'User',
            first_name: 'User',
            role: 'guest',
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Check if user has a session (email confirmed) or needs verification
      // If there's no session, email confirmation is required
      if (signUpData.session) {
        // Email already confirmed, user is logged in (has session)
        toast.success('Account created and logged in!');
        router.push('/');
      } else {
        // Email confirmation required - no session means email needs to be confirmed
        toast.success('Account created! Please confirm your email to sign in.', {
          duration: 5000,
        });
        // Redirect to signin page with message
        router.push('/auth/signin?email=' + encodeURIComponent(formData.email) + '&message=confirm-email');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg mx-auto mb-4">
            <img 
              src="/eja_svg.svg" 
              alt="EJA Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-xl font-bold text-center mb-2 text-gray-900">Create a new account</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                error={emailError}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              {/* Password and Confirm Password */}
              <div className="flex gap-4">
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>


              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors" 
                  loading={loading} 
                  disabled={loading}
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </div>
            </form>
            <div className="mt-3 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 