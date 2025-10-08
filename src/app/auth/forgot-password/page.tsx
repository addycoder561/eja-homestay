'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

function ForgotPasswordInner() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg mx-auto mb-6">
              <img 
                src="/eja_svg.svg" 
                alt="EJA Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold text-center text-gray-900">Check your email</h1>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg text-base transition-colors"
                  >
                    Try different email
                  </Button>
                  
                  <Link href="/auth/signin">
                    <Button 
                      type="button"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-base transition-colors"
                    >
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-lg mx-auto mb-6">
            <img 
              src="/eja_svg.svg" 
              alt="EJA Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center text-gray-900">Forgot your password?</h1>
            <p className="text-center text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  error={emailError}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-base transition-colors"
                loading={loading} 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <Suspense>
      <ForgotPasswordInner />
    </Suspense>
  );
}
