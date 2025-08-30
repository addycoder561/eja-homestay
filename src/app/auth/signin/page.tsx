'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import toast from 'react-hot-toast';

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signInWithGoogle, profile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      const result = await signIn(formData.email, formData.password);
      console.log('SignIn result:', result); // DEBUG LOG
      if (!result.error) {
        toast.success('Signed in successfully!');
        // Wait for profile to be available and auth state to update
        setTimeout(() => {
          const redirect = searchParams.get('redirect');
          if (redirect) {
            router.push(redirect);
          } else if (profile?.role === 'host' || profile?.is_host) {
            router.push('/host/dashboard');
          } else {
            router.push('/');
          }
        }, 500); // Increased timeout to ensure auth state is updated
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center mb-4">
                <img 
                  src="/eja_02.svg" 
                  alt="EJA Logo" 
                  className="w-[225px] h-[225px]"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back! Please enter your details.
              </p>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                className="w-full mb-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => signInWithGoogle(searchParams.get('redirect') ? `${window.location.origin}${searchParams.get('redirect')}` : undefined)}
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.69 30.77 0 24 0 14.82 0 6.71 5.13 2.69 12.56l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.19 5.59C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.13c-1.01-2.99-1.01-6.27 0-9.26l-7.98-6.2C.99 16.09 0 19.93 0 24c0 4.07.99 7.91 2.69 11.33l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-6.38 0-11.87-3.59-14.33-8.79l-7.98 6.2C6.71 42.87 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
                Sign in with Google
              </Button>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setEmailError('');
                  }}
                  placeholder="Enter your email"
                  error={emailError}
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={loading} disabled={loading}>
                  Sign In
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}