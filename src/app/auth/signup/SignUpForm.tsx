"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'host' ? 'host' : 'guest';
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthday: {
      day: '',
      month: '',
      year: ''
    },
    gender: '',
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
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const result = await signUp(formData.email, formData.password, fullName, formData.role as 'guest' | 'host');
      console.log('Signup result:', result); // DEBUG LOG
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
      <main className="max-w-md mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Create a new account</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name and Last Name in one line */}
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="flex-1"
                />
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="flex-1"
                />
              </div>

              {/* Birthday in one line */}
              <div className="flex gap-2">
                <select
                  value={formData.birthday.day}
                  onChange={e => setFormData({ ...formData, birthday: { ...formData.birthday, day: e.target.value } })}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="" className="text-gray-500">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={formData.birthday.month}
                  onChange={e => setFormData({ ...formData, birthday: { ...formData.birthday, month: e.target.value } })}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="" className="text-gray-500">Month</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                  <option value="04">April</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
                <select
                  value={formData.birthday.year}
                  onChange={e => setFormData({ ...formData, birthday: { ...formData.birthday, year: e.target.value } })}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="" className="text-gray-500">Year</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Gender in one line */}
              <div className="flex gap-4">
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-900 font-medium">Female</span>
                </label>
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-900 font-medium">Male</span>
                </label>
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="gender"
                    value="custom"
                    checked={formData.gender === 'custom'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-gray-900 font-medium">Custom</span>
                </label>
              </div>

              {/* Mobile or Email in one line */}
              <Input
                type="email"
                placeholder="Mobile or Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                error={emailError}
              />

              {/* New Password and Confirm Password in one line */}
              <div className="flex gap-4">
                <Input
                  type="password"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="flex-1"
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="flex-1"
                />
              </div>

              {/* Role Selection */}
              <div className="flex gap-4">
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="role"
                    value="guest"
                    checked={formData.role === 'guest'}
                    onChange={() => setFormData({ ...formData, role: 'guest' })}
                    className="mr-2"
                  />
                  <span className="text-gray-900 font-medium">Guest</span>
                </label>
                <label className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={formData.role === 'host'}
                    onChange={() => setFormData({ ...formData, role: 'host' })}
                    className="mr-2"
                  />
                  <span className="text-gray-900 font-medium">Host</span>
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
    </div>
  );
} 