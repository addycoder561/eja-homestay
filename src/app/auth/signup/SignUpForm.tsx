"use client";

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

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'host' ? 'host' : 'guest';
  const { signUp, signInWithGoogle } = useAuth();
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-md mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold mb-2">Sign Up</h1>
            <p className="text-gray-600">Create your account to get started</p>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              className="w-full mb-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              onClick={() => signInWithGoogle(searchParams.get('redirect') ? `${window.location.origin}${searchParams.get('redirect')}` : undefined)}
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.68 2.69 30.77 0 24 0 14.82 0 6.71 5.13 2.69 12.56l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.19 5.59C43.93 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.13c-1.01-2.99-1.01-6.27 0-9.26l-7.98-6.2C.99 16.09 0 19.93 0 24c0 4.07.99 7.91 2.69 11.33l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.59c-2.01 1.35-4.59 2.15-8.7 2.15-6.38 0-11.87-3.59-14.33-8.79l-7.98 6.2C6.71 42.87 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Sign up with Google
            </Button>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                error={emailError}
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="guest"
                    checked={formData.role === 'guest'}
                    onChange={() => setFormData({ ...formData, role: 'guest' })}
                  />
                  <span className="ml-2">Guest</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={formData.role === 'host'}
                    onChange={() => setFormData({ ...formData, role: 'host' })}
                  />
                  <span className="ml-2">Host</span>
                </label>
              </div>
              <Button type="submit" className="w-full" loading={loading} disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
} 