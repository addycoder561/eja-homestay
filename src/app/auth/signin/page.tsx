'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, profile } = useAuth();
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
      if (!result.error) {
        toast.success('Signed in successfully!');
        // Wait for profile to be available and auth state to update
        setTimeout(() => {
          const redirect = searchParams.get('redirect');
          if (redirect) {
            router.push(redirect);
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

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-5">
            <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setEmailError('');
                }}
                placeholder="Email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Forgot password?
              </Link>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                loading={loading} 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Link href="/auth/signup">
                <Button 
                  type="button"
                  className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Create new account
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
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