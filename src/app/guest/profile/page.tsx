'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: {
      day: '',
      month: '',
      year: ''
    },
    gender: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (profile) {
      const nameParts = profile.full_name?.split(' ') || [];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        birthday: {
          day: profile.birthday_day || '',
          month: profile.birthday_month || '',
          year: profile.birthday_year || ''
        },
        gender: profile.gender || ''
      });
    }
  }, [user, profile, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          email: formData.email,
          phone: formData.phone || null,
          birthday_day: formData.birthday.day || null,
          birthday_month: formData.birthday.month || null,
          birthday_year: formData.birthday.year || null,
          gender: formData.gender || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully!');
      
      // Update email in auth if it changed
      if (formData.email !== user!.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) {
          toast.error('Profile updated but email change requires verification');
        } else {
          toast.success('Please check your email to verify the new address');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <p className="text-gray-600">Update your personal information</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  error={errors.email}
                  required
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  error={errors.phone}
                  placeholder="+91 98765 43210"
                />

                {/* Birthday */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.birthday.day}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        birthday: { ...prev.birthday, day: e.target.value } 
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <select
                      value={formData.birthday.month}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        birthday: { ...prev.birthday, month: e.target.value } 
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Month</option>
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
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        birthday: { ...prev.birthday, year: e.target.value } 
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-gray-900 font-medium">Female</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-gray-900 font-medium">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="custom"
                        checked={formData.gender === 'custom'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="mr-2"
                      />
                      <span className="text-gray-900 font-medium">Custom</span>
                    </label>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
              <p className="text-gray-600">Update your account password</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  error={errors.currentPassword}
                  required
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  error={errors.newPassword}
                  required
                  minLength={6}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  error={errors.confirmPassword}
                  required
                />
                
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full"
                >
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Account Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                </div>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // TODO: Implement account deletion
                      toast.error('Account deletion not implemented yet');
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
} 