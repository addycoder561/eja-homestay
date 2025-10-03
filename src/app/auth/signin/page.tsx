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
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Left Section - EJA Branding */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
          <div className="max-w-md">
            <div className="mb-8">
              <img 
                src="/eja_transparent svg.svg" 
                alt="EJA Logo" 
                className="w-56 h-22 mb-6 object-contain"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Experience the world on EJA.
            </h1>
          </div>
        </div>

        {/* Right Section - Sign In Form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setEmailError('');
                  }}
                  placeholder="Email or phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
                )}

                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg"
                  loading={loading} 
                  disabled={loading}
                >
                  Log In
                </Button>

                <div className="text-center">
                  <Link href="/auth/forgot-password" className="text-yellow-500 hover:underline text-sm font-bold">
                    Forgot password?
                  </Link>
                </div>

                <div className="border-t border-gray-300 my-6"></div>

                <div className="flex justify-center">
                  <Link href="/auth/signup">
                    <Button 
                      type="button"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-base whitespace-nowrap"
                    >
                      Create new account
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Create a club for a creator, brand, or business.
                </p>
              </div>
            </div>
          </div>
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