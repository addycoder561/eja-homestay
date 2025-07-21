'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import toast from 'react-hot-toast';

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'host' ? 'host' : 'guest';
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
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
      const result = await signUp(formData.email, formData.password, formData.fullName, formData.role as 'guest' | 'host');
      if (!result.error) {
        toast.success('Account created and logged in!');
        if (formData.role === 'host') {
          router.push('/host/dashboard');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Join thousands of travelers and hosts worldwide
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full name"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />

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
                    placeholder="Create a password"
                  />

                  <Input
                    label="Confirm password"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                  />

                  {/* Role selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Sign up as</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="guest"
                          checked={formData.role === 'guest'}
                          onChange={() => setFormData({ ...formData, role: 'guest' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Guest</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="role"
                          value="host"
                          checked={formData.role === 'host'}
                          onChange={() => setFormData({ ...formData, role: 'host' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Host</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="agree-terms"
                      name="agree-terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                      I agree to the{' '}
                      <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                  >
                    Create account
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
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
    </Suspense>
  );
} 