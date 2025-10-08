'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SupportModal } from '@/components/SupportModal';
import { 
  UserIcon, 
  HeartIcon, 
  UserGroupIcon, 
  SparklesIcon,
  CameraIcon,
  PencilIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileData {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  mood_tag: string;
  created_at: string;
}

interface Experience {
  id: string;
  title: string;
  cover_image: string;
  mood: string;
  location: string;
  created_at: string;
  likes_count: number;
  views_count: number;
}

interface Metrics {
  check_ins: number;
  followers: number;
  smiles: number;
}

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    check_ins: 0,
    followers: 0,
    smiles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    mood_tag: ''
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        // Use the profile from AuthContext if available, otherwise fetch from API
        if (profile) {
          setProfileData({
            id: profile.id,
            full_name: profile.full_name || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || '',
            mood_tag: profile.mood_tag || '',
            created_at: profile.created_at || new Date().toISOString()
          });
          setEditForm({
            full_name: profile.full_name || '',
            bio: profile.bio || '',
            mood_tag: profile.mood_tag || ''
          });
        }

        // Fetch created experiences using the database function
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences_unified')
          .select('id, title, cover_image, mood, location, created_at')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (experiencesError) {
          console.error('Error fetching experiences:', experiencesError);
          setExperiences([]);
        } else {
          // Add mock metrics for now (you can implement real metrics later)
          const experiencesWithMetrics = (experiencesData || []).map(exp => ({
            ...exp,
            likes_count: Math.floor(Math.random() * 100),
            views_count: Math.floor(Math.random() * 500)
          }));

          setExperiences(experiencesWithMetrics);

          // Calculate metrics
          const totalLikes = experiencesWithMetrics.reduce((sum, exp) => sum + exp.likes_count, 0);
          setMetrics({
            check_ins: experiencesData?.length || 0,
            followers: Math.floor(Math.random() * 1000), // Mock data
            smiles: totalLikes
          });
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, profile]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editForm.full_name,
          bio: editForm.bio,
          mood_tag: editForm.mood_tag,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfileData(prev => prev ? {
        ...prev,
        full_name: editForm.full_name,
        bio: editForm.bio,
        mood_tag: editForm.mood_tag
      } : null);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link href="/auth/signin" className="text-yellow-500 hover:text-yellow-600">
            Sign in to view your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              
              {/* Three Dashes Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bars3Icon className="w-6 h-6 text-gray-700" />
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-2">
                      <Link
                        href="/guest/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/guest/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserIcon className="w-5 h-5" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setSupportOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <QuestionMarkCircleIcon className="w-5 h-5" />
                        Support
                      </button>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Glassmorphism Profile Card */}
        <div className="relative mb-8">
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-blue-400/30"></div>
          </div>
          
          {/* Glassmorphism Card */}
          <div className="relative backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              {/* Profile Picture */}
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-white/30 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center overflow-hidden shadow-xl">
                  {profileData?.avatar_url ? (
                    <Image
                      src={profileData.avatar_url}
                      alt="Profile picture"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-white/80" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-yellow-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-yellow-600/90 transition-colors shadow-lg border-2 border-white/50">
                    <CameraIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Name */}
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {profileData?.full_name || 'Your Name'}
              </h2>
              
              {/* Bio */}
              {profileData?.bio && (
                <p className="text-white/90 mb-4 text-lg drop-shadow-md max-w-md">
                  {profileData.bio}
                </p>
              )}
              
              {/* Mood Tag */}
              {profileData?.mood_tag && (
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6 border border-white/30">
                  {profileData.mood_tag}
                </span>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-lg">{metrics.check_ins}</div>
                  <div className="text-sm text-white/80 font-medium">CHECK-INS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-lg">{metrics.followers}</div>
                  <div className="text-sm text-white/80 font-medium">FOLLOWERS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-lg">{metrics.smiles}</div>
                  <div className="text-sm text-white/80 font-medium">SMILES</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-lg">
                  Follow
                </button>
                <button className="px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white/50 hover:bg-white/10 transition-all duration-200 shadow-lg">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Overlay */}
        {isEditing && (
          <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mood Tag
                </label>
                <input
                  type="text"
                  value={editForm.mood_tag}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mood_tag: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Your vibe (e.g., Adventure, Creative, Chill)"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Instagram Style Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border">
          {/* Tab Navigation */}
          {/* Removed tab navigation - only experiences section remains */}

          {/* Content */}
          <div className="p-6">
            {/* Created Experiences - Full Width */}
            <div>
              {experiences.length === 0 ? (
                <div className="text-center py-12">
                  <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No experiences yet</h4>
                  <p className="text-gray-600 mb-4">Start creating amazing experiences to share with the world!</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Create Your First Experience
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="group cursor-pointer">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                        {experience.cover_image ? (
                          <Image
                            src={experience.cover_image}
                            alt={experience.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <SparklesIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="text-white text-center">
                            <HeartIcon className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm font-medium">{experience.likes_count}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {experience.title}
                        </h4>
                        <p className="text-xs text-gray-600">{experience.mood}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Support Modal */}
      <SupportModal 
        open={supportOpen} 
        onClose={() => setSupportOpen(false)} 
      />
    </div>
  );
}
