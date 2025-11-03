'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getUserSocialStats, getUserReactionCount } from '@/lib/social-api';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SupportModal } from '@/components/SupportModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { 
  UserIcon, 
  HeartIcon, 
  UserGroupIcon, 
  SparklesIcon,
  CameraIcon,
  PencilIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { 
  FireIcon as FireSolidIcon,
  TrophyIcon as TrophySolidIcon
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
  aura: 'low' | 'high' | 'elite';
}

interface Dare {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  vibe: string;
  expiry_date: string;
  created_at: string;
  completion_count: number;
  smile_count: number;
  comment_count: number;
  share_count: number;
}

interface Follower {
  id: string;
  full_name: string;
  avatar_url: string;
  engagement_score: number;
  completed_dares: number;
  total_smiles: number;
}

function ProfilePageContent() {
  const { user, profile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [dares, setDares] = useState<Dare[]>([]);
  const [topFollowers, setTopFollowers] = useState<Follower[]>([]);
  const [activeTab, setActiveTab] = useState<'experiences' | 'dares' | 'followers'>('experiences');
  const [metrics, setMetrics] = useState<Metrics>({
    check_ins: 0,
    followers: 0,
    smiles: 0,
    aura: 'low'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    mood_tag: ''
  });
  const [supportOpen, setSupportOpen] = useState(false);

  // Calculate aura level based on metrics
  const calculateAura = (checkIns: number, followers: number, smiles: number): 'low' | 'high' | 'elite' => {
    const totalScore = checkIns + followers + smiles;
    
    if (totalScore >= 100) return 'elite';
    if (totalScore >= 30) return 'high';
    return 'low';
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

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

        // Fetch data in parallel to improve performance
        const [experiencesResult, daresResult, followersResult, socialStatsResult, reactionCountResult] = await Promise.allSettled([
          // Fetch created experiences
          supabase
            .from('experiences_with_host')
            .select('id, title, cover_image, mood, location, created_at')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false }),
          // Fetch created dares
          supabase
            .from('dares')
            .select('id, title, description, hashtag, vibe, expiry_date, created_at, completion_count, smile_count, comment_count, share_count')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false }),
          // Fetch top followers (mock data for now)
          Promise.resolve({
            data: [
              {
                id: '1',
                full_name: 'Alex Johnson',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                engagement_score: 95,
                completed_dares: 12,
                total_smiles: 48
              },
              {
                id: '2',
                full_name: 'Sarah Chen',
                avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
                engagement_score: 87,
                completed_dares: 9,
                total_smiles: 35
              },
              {
                id: '3',
                full_name: 'Mike Rodriguez',
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                engagement_score: 82,
                completed_dares: 7,
                total_smiles: 28
              },
              {
                id: '4',
                full_name: 'Emma Wilson',
                avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                engagement_score: 78,
                completed_dares: 6,
                total_smiles: 22
              },
              {
                id: '5',
                full_name: 'David Kim',
                avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                engagement_score: 75,
                completed_dares: 5,
                total_smiles: 18
              }
            ]
          }),
          // Get social stats
          getUserSocialStats(user.id),
          // Get reaction count
          getUserReactionCount(user.id)
        ]);

        // Handle experiences data
        if (experiencesResult.status === 'fulfilled') {
          const { data: experiencesData, error: experiencesError } = experiencesResult.value;
          
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
          }
        } else {
          console.error('Error in experiences fetch:', experiencesResult.reason);
          setExperiences([]);
        }

        // Handle dares data
        if (daresResult.status === 'fulfilled') {
          const { data: daresData, error: daresError } = daresResult.value;
          
          if (daresError) {
            console.error('Error fetching dares:', daresError);
            setDares([]);
          } else {
            setDares(daresData || []);
          }
        } else {
          console.error('Error in dares fetch:', daresResult.reason);
          setDares([]);
        }

        // Handle followers data
        if (followersResult.status === 'fulfilled') {
          const { data: followersData } = followersResult.value;
          setTopFollowers(followersData || []);
        } else {
          console.error('Error in followers fetch:', followersResult.reason);
          setTopFollowers([]);
        }

        // Handle social stats
        const socialStats = socialStatsResult.status === 'fulfilled' ? socialStatsResult.value : { success: false };
        const reactionCount = reactionCountResult.status === 'fulfilled' ? reactionCountResult.value : { success: false };
        
        const checkIns = experiencesResult.status === 'fulfilled' ? (experiencesResult.value.data?.length || 0) : 0;
        const followers = socialStats.success ? socialStats.data?.follower_count || 0 : 0;
        const smiles = reactionCount.success ? reactionCount.count : 0;
        const aura = calculateAura(checkIns, followers, smiles);

        setMetrics({
          check_ins: checkIns,
          followers: followers,
          smiles: smiles,
          aura: aura
        });

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, profile]);


  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      console.log('💾 Saving profile:', {
        id: user.id,
        full_name: editForm.full_name,
        bio: editForm.bio,
        mood_tag: editForm.mood_tag
      });

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editForm.full_name,
          bio: editForm.bio,
          mood_tag: editForm.mood_tag,
          updated_at: new Date().toISOString()
        })
        .select();

      console.log('💾 Profile save result:', { data, error });

      if (error) {
        console.error('❌ Profile save error:', error);
        throw error;
      }

      setProfileData(prev => prev ? {
        ...prev,
        full_name: editForm.full_name,
        bio: editForm.bio,
        mood_tag: editForm.mood_tag
      } : null);

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message || 'Please try again.'}`);
    }
  };

  const handleImageUpload = async () => {
    if (!user) return;

    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        console.log('📸 Uploading image:', file.name, file.size);

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size must be less than 5MB');
          return;
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        console.log('📸 Uploading to:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        console.log('📸 Upload result:', { uploadData, uploadError });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        console.log('📸 Public URL:', publicUrl);

        // Update profile with new avatar URL
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .select();

        console.log('📸 Profile update result:', { updateData, updateError });

        if (updateError) {
          console.error('❌ Profile update error:', updateError);
          throw updateError;
        }

        // Update local state
        setProfileData(prev => prev ? {
          ...prev,
          avatar_url: publicUrl
        } : null);

        toast.success('Profile picture updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload image: ${error.message || 'Please try again.'}`);
      }
    };
    input.click();
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
    return <LoadingSpinner message="Loading your profile..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your profile</h2>
            <p className="text-gray-600 mb-6">Create an account or sign in to manage your profile settings and preferences.</p>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Identity Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6 relative">
          {/* Edit & Menu Buttons - Top Right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
            
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileData?.avatar_url ? (
                  <Image
                    src={profileData.avatar_url}
                    alt="Profile picture"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={handleImageUpload}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      placeholder="Your display name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Your vibe (e.g., Adventure, Creative, Chill)"
                      />
                    </div>
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
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {profileData?.full_name || 'Your Name'}
                  </h2>
                  {profileData?.bio && (
                    <p className="text-gray-600 mb-3">{profileData.bio}</p>
                  )}
                  {profileData?.mood_tag && (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-4">
                      {profileData.mood_tag}
                    </span>
                  )}
                  
                  {/* Metrics integrated into profile section */}
                  <div className="flex gap-6 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{metrics.check_ins}</div>
                      <div className="text-xs text-gray-600">Check-ins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{metrics.followers}</div>
                      <div className="text-xs text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{metrics.smiles}</div>
                      <div className="text-xs text-gray-600">Smiles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 capitalize">{metrics.aura}</div>
                      <div className="text-xs text-gray-600">Aura</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Instagram Style Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('experiences')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'experiences'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SparklesIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Experiences</span>
              </button>
              <button
                onClick={() => setActiveTab('dares')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dares'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FireIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Dropped Dares</span>
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'followers'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrophyIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Top Followers</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Experiences Tab */}
            {activeTab === 'experiences' && (
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
            )}

            {/* Dropped Dares Tab */}
            {activeTab === 'dares' && (
              <div>
                {dares.length === 0 ? (
                  <div className="text-center py-12">
                    <FireIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No dares dropped yet</h4>
                    <p className="text-gray-600 mb-4">Start dropping exciting dares for the community to complete!</p>
                    <Link 
                      href="/drop"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <FireIcon className="w-4 h-4" />
                      Drop Your First Dare
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dares.map((dare) => (
                      <div key={dare.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <FireSolidIcon className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                {dare.title}
                              </h4>
                              <p className="text-xs text-gray-500">#{dare.hashtag}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            dare.vibe === 'Happy' ? 'bg-green-100 text-green-800' :
                            dare.vibe === 'Chill' ? 'bg-blue-100 text-blue-800' :
                            dare.vibe === 'Bold' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {dare.vibe}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {dare.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <HeartIcon className="w-4 h-4" />
                              <span>{dare.smile_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserGroupIcon className="w-4 h-4" />
                              <span>{dare.completion_count}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{new Date(dare.expiry_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Top Followers Tab */}
            {activeTab === 'followers' && (
              <div>
                {topFollowers.length === 0 ? (
                  <div className="text-center py-12">
                    <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h4>
                    <p className="text-gray-600 mb-4">Start creating content to attract followers!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Top 5 Followers</h3>
                      <p className="text-sm text-gray-600">Ranked by engagement and dare completions</p>
                    </div>
                    {topFollowers.map((follower, index) => (
                      <div key={follower.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                              {follower.avatar_url ? (
                                <Image
                                  src={follower.avatar_url}
                                  alt={follower.full_name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <UserIcon className="w-6 h-6 text-gray-400 m-3" />
                              )}
                            </div>
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                'bg-orange-500 text-white'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{follower.full_name}</h4>
                            <p className="text-sm text-gray-600">Engagement Score: {follower.engagement_score}%</p>
                          </div>
                        </div>
                        <div className="flex-1" />
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FireIcon className="w-4 h-4" />
                              <span>{follower.completed_dares} dares</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HeartIcon className="w-4 h-4" />
                              <span>{follower.total_smiles} smiles</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}
