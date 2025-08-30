'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getDelightTasks, 
  getDelightStories, 
  getUserDelightStats, 
  getUserRankContext,
  debugDatabaseState,
  DelightTask,
  DelightStory,
  LeaderboardEntry
} from '@/lib/delight-api';
import { 
  SparklesIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  CameraIcon,
  CalendarIcon,
  UserIcon,
  FireIcon,
  ShareIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from '@/components/ui/Card';
import { DelightProofModal } from '@/components/DelightProofModal';
import { DelightStories } from '@/components/DelightStories';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function DelightPage() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<DelightTask[]>([]);
  const [stories, setStories] = useState<DelightStory[]>([]);
  const [userStats, setUserStats] = useState<{
    totalPoints: number;
    recentPoints: number;
    totalSmiles: number;
    recentSmiles: number;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DelightTask | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [storyLikes, setStoryLikes] = useState<Record<string, number>>({});
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  useEffect(() => {
    loadDelightData();
  }, [selectedCategory]);

  const loadDelightData = async () => {
    try {
      setLoading(true);
      
      // Debug database state first
      await debugDatabaseState();
      
      const [tasksData, storiesData, statsData, rankData] = await Promise.all([
        getDelightTasks(selectedCategory),
        getDelightStories(10),
        getUserDelightStats(), // Always call this, it handles unauthenticated users
        getUserRankContext()   // Always call this, it handles unauthenticated users
      ]);

      console.log('Loaded data:', {
        tasks: tasksData?.length,
        stories: storiesData?.length,
        stats: statsData,
        rank: rankData
      });

      setTasks(tasksData);
      setStories(storiesData);
      if (statsData) setUserStats(statsData);
      if (rankData) {
        setUserRank(rankData.userRank);
        setLeaderboard(rankData.surroundingUsers);
      }

      // Load existing likes if user is authenticated
      if (user && storiesData.length > 0) {
        await loadExistingLikes(storiesData.map(story => story.id));
      }
    } catch (error) {
      console.error('Error loading delight data:', error);
      toast.error('Failed to load delight data');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingLikes = async (storyIds: string[]) => {
    try {
      // Get user's existing likes
      const { data: userLikes } = await supabase
        .from('likes')
        .select('content_id')
        .eq('user_id', user?.id)
        .eq('content_type', 'delight_story')
        .in('content_id', storyIds);

      if (userLikes) {
        setLikedStories(new Set(userLikes.map(like => like.content_id)));
      }

      // Get like counts for all stories
      const { data: likeCounts } = await supabase
        .from('likes')
        .select('content_id')
        .eq('content_type', 'delight_story')
        .in('content_id', storyIds);

      if (likeCounts) {
        const counts: Record<string, number> = {};
        likeCounts.forEach(like => {
          counts[like.content_id] = (counts[like.content_id] || 0) + 1;
        });
        setStoryLikes(counts);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const handleDoIt = (task: DelightTask) => {
    setSelectedTask(task);
    setShowDatePicker(true);
  };

  const handleUploadProof = (task: DelightTask) => {
    setSelectedTask(task);
    setShowProofModal(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    // TODO: Send notification to task host
    toast.success(`Scheduled ${selectedTask?.title} for ${new Date(date).toLocaleDateString()}`);
    setSelectedTask(null);
  };

  const handleProofSuccess = () => {
    loadDelightData(); // Refresh data after successful proof upload
  };

  const handleLikeStory = async (storyId: string) => {
    if (!user) {
      toast.error('Please sign in to like stories');
      return;
    }

    try {
      const isLiked = likedStories.has(storyId);
      
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', storyId)
          .eq('content_type', 'delight_story');
        
        setLikedStories(prev => {
          const newSet = new Set(prev);
          newSet.delete(storyId);
          return newSet;
        });
        
        setStoryLikes(prev => ({
          ...prev,
          [storyId]: (prev[storyId] || 1) - 1
        }));
        
        toast.success('Story unliked');
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            content_id: storyId,
            content_type: 'delight_story'
          });
        
        setLikedStories(prev => new Set([...prev, storyId]));
        setStoryLikes(prev => ({
          ...prev,
          [storyId]: (prev[storyId] || 0) + 1
        }));
        
        toast.success('Story liked!');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShareStory = async (story: DelightStory) => {
    try {
      const shareText = `${story.user?.full_name || 'Someone'} did ${story.task?.title || 'a delight task'}! Check it out on our platform.`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Delight Story',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Story link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      toast.error('Failed to share story');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🌟' },
    { id: 'environment', name: 'Environment', icon: '🌱' },
    { id: 'community', name: 'Community', icon: '🤝' },
    { id: 'health', name: 'Health', icon: '❤️' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'animals', name: 'Animals', icon: '🐾' },
    { id: 'kindness', name: 'Kindness', icon: '💝' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Delight</h1>
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Spread joy, make a difference, and earn points through acts of kindness and social good
          </p>
        </div>

        {/* Instagram-style Delight Stories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HeartIcon className="w-6 h-6 text-red-500" />
            Delight Stories
          </h2>
          <DelightStories
            stories={stories}
            likedStories={likedStories}
            storyLikes={storyLikes}
            onLikeStory={handleLikeStory}
            onShareStory={handleShareStory}
          />
        </div>

        {/* Mobile Filter Chips */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FireIcon className="w-4 h-4 text-yellow-500" />
              Categories
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <TrophyIcon className="w-4 h-4 text-yellow-500" />
              Leaderboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar - Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-yellow-500" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                      selectedCategory === category.id
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Delight Tasks */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                Delight Tasks ({tasks.length})
              </h2>
              <div className="space-y-6">
                {tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/3">
                          <div className="aspect-video bg-gray-200 rounded-t-xl md:rounded-l-xl md:rounded-t-none overflow-hidden">
                            <img 
                              src={task.cover_image} 
                              alt={task.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-2/3 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{task.subtitle}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              {task.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {task.duration_minutes} min
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                              {task.smile_count || 0} 😊
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                              {task.base_points} points
                            </div>
                            <div className="text-sm text-gray-500">
                              {task.category}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleDoIt(task)}
                              className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                            >
                              Do it
                            </button>
                            <button 
                              onClick={() => handleUploadProof(task)}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                              Upload proof
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Right Sidebar - Leaderboard */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                Leaderboard
              </h3>
              
              {userStats && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600">Your Rank</div>
                    <div className="text-2xl font-bold text-gray-900">#{userRank || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{userStats.totalSmiles}</div>
                      <div className="text-xs text-gray-600">Lifetime Smiles</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{userStats.recentSmiles}</div>
                      <div className="text-xs text-gray-600">3 Months</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{entry.full_name}</div>
                        <div className="text-xs text-gray-500">{entry.total_points} smiles</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No leaderboard data yet</p>
                    <p className="text-xs text-gray-400">Complete tasks to start earning smiles!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Date Picker Modal */}
      {showDatePicker && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule {selectedTask.title}</h3>
            <p className="text-gray-600 mb-6">Choose when you plan to complete this task:</p>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDateSelect(selectedDate)}
                disabled={!selectedDate}
                className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Categories Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 lg:hidden">
          <div className="bg-white rounded-t-2xl w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Categories</h3>
                <button
                  onClick={() => setShowCategoriesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setShowCategoriesModal(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                      selectedCategory === category.id
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 lg:hidden">
          <div className="bg-white rounded-t-2xl w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Leaderboard</h3>
                <button
                  onClick={() => setShowLeaderboardModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {userStats && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600">Your Rank</div>
                    <div className="text-2xl font-bold text-gray-900">#{userRank || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{userStats.totalSmiles}</div>
                      <div className="text-xs text-gray-600">Lifetime Smiles</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{userStats.recentSmiles}</div>
                      <div className="text-xs text-gray-600">3 Months</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{entry.full_name}</div>
                        <div className="text-xs text-gray-500">{entry.total_points} smiles</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No leaderboard data yet</p>
                    <p className="text-xs text-gray-400">Complete tasks to start earning smiles!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Upload Modal */}
      {showProofModal && selectedTask && (
        <DelightProofModal
          isOpen={showProofModal}
          onClose={() => setShowProofModal(false)}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          onSuccess={handleProofSuccess}
        />
      )}

      <Footer />
    </div>
  );
}
