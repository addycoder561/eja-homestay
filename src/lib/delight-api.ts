import { supabase } from './supabase';

export interface DelightTask {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover_image: string;
  location: string;
  duration_minutes: number;
  category: string;
  base_points: number;
  is_active: boolean;
  created_at: string;
  smile_count?: number;
}

export interface DelightStory {
  id: string;
  task_id: string;
  user_id: string;
  proof_media: string;
  proof_text: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  is_approved: boolean;
  created_at: string;
  task?: DelightTask;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface DelightPoints {
  id: string;
  user_id: string;
  task_id: string;
  story_id: string;
  base_points: number;
  doubled_points: number;
  total_points: number;
  is_doubled: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_points: number;
  recent_points: number;
  rank: number;
}

// Fetch all delight tasks
export async function getDelightTasks(category?: string): Promise<DelightTask[]> {
  let query = supabase
    .from('delight_tasks')
    .select(`
      *,
      delight_smiles(smile_count)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching delight tasks:', error);
    throw error;
  }

  return data?.map(task => ({
    ...task,
    smile_count: task.delight_smiles?.[0]?.smile_count || 0
  })) || [];
}

// Fetch delight stories for the stories section
export async function getDelightStories(limit: number = 10): Promise<DelightStory[]> {
  console.log('Fetching delight stories...');
  
  // First, get stories without joins
  const { data: storiesData, error: storiesError } = await supabase
    .from('delight_stories')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (storiesError) {
    console.error('Error fetching stories:', storiesError);
    return [];
  }

  console.log('Stories data:', storiesData);

  if (!storiesData || storiesData.length === 0) {
    return [];
  }

  // Get unique task IDs and user IDs
  const taskIds = [...new Set(storiesData.map(story => story.task_id))];
  const userIds = [...new Set(storiesData.map(story => story.user_id))];

  // Get tasks separately
  const { data: tasksData } = await supabase
    .from('delight_tasks')
    .select('*')
    .in('id', taskIds);

  // Get profiles separately
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  console.log('Tasks data:', tasksData);
  console.log('Profiles data:', profilesData);

  // Combine the data
  return storiesData.map(story => ({
    ...story,
    task: tasksData?.find(task => task.id === story.task_id),
    user: profilesData?.find(profile => profile.id === story.user_id)
  }));
}

// Upload proof for a delight task
export async function uploadDelightProof(
  taskId: string,
  proofMedia: string,
  proofText: string,
  latitude: number,
  longitude: number
): Promise<{ success: boolean; storyId?: string; points?: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Start a transaction
  const { data: story, error: storyError } = await supabase
    .from('delight_stories')
    .insert({
      task_id: taskId,
      user_id: user.id,
      proof_media: proofMedia,
      proof_text: proofText,
      latitude,
      longitude
    })
    .select()
    .single();

  if (storyError) {
    console.error('Error creating story:', storyError);
    throw storyError;
  }

  // Update smile count
  const { error: smileError } = await supabase
    .from('delight_smiles')
    .update({ 
      smile_count: 1,
      last_updated: new Date().toISOString()
    })
    .eq('task_id', taskId);

  if (smileError) {
    console.error('Error updating smile count:', smileError);
    throw smileError;
  }

  // Get task details for points calculation
  const { data: task } = await supabase
    .from('delight_tasks')
    .select('base_points')
    .eq('id', taskId)
    .single();

  const basePoints = task?.base_points || 1500;

  // Check if smiles doubled
  const { data: smilesData } = await supabase
    .from('delight_smiles')
    .select('smile_count')
    .eq('task_id', taskId)
    .single();

  const currentSmiles = smilesData?.smile_count || 0;
  const isDoubled = currentSmiles % 2 === 0 && currentSmiles > 0;
  const doubledPoints = isDoubled ? basePoints : 0;
  const totalPoints = basePoints + doubledPoints;

  // Insert points record
  const { error: pointsError } = await supabase
    .from('delight_points')
    .insert({
      user_id: user.id,
      task_id: taskId,
      story_id: story.id,
      base_points: basePoints,
      doubled_points: doubledPoints,
      total_points: totalPoints,
      is_doubled: isDoubled
    });

  if (pointsError) {
    console.error('Error creating points record:', pointsError);
    throw pointsError;
  }

  return {
    success: true,
    storyId: story.id,
    points: totalPoints
  };
}

// Get user's delight points and stats
export async function getUserDelightStats(): Promise<{
  totalPoints: number;
  recentPoints: number;
  totalSmiles: number;
  recentSmiles: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Return default values if user is not authenticated
    return {
      totalPoints: 0,
      recentPoints: 0,
      totalSmiles: 0,
      recentSmiles: 0
    };
  }

  try {
    // Get total points
    const { data: totalPointsData } = await supabase
      .from('delight_points')
      .select('total_points')
      .eq('user_id', user.id);

    const totalPoints = totalPointsData?.reduce((sum, record) => sum + record.total_points, 0) || 0;

    // Get recent points (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: recentPointsData } = await supabase
      .from('delight_points')
      .select('total_points')
      .eq('user_id', user.id)
      .gte('created_at', threeMonthsAgo.toISOString());

    const recentPoints = recentPointsData?.reduce((sum, record) => sum + record.total_points, 0) || 0;

    // Get total smiles
    const { data: totalSmilesData } = await supabase
      .from('delight_stories')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_approved', true);

    const totalSmiles = totalSmilesData?.length || 0;

    // Get recent smiles
    const { data: recentSmilesData } = await supabase
      .from('delight_stories')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_approved', true)
      .gte('created_at', threeMonthsAgo.toISOString());

    const recentSmiles = recentSmilesData?.length || 0;

    return {
      totalPoints,
      recentPoints,
      totalSmiles,
      recentSmiles
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return default values on error
    return {
      totalPoints: 0,
      recentPoints: 0,
      totalSmiles: 0,
      recentSmiles: 0
    };
  }
}

// Get leaderboard
export async function getDelightLeaderboard(): Promise<LeaderboardEntry[]> {
  console.log('Fetching leaderboard...');
  
  // Simple query without joins
  const { data, error } = await supabase
    .from('delight_stories')
    .select('user_id, created_at')
    .eq('is_approved', true);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  console.log('Leaderboard raw data:', data);

  if (!data || data.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(data.map(record => record.user_id))];
  
  // Get profiles separately
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  console.log('Profiles for leaderboard:', profilesData);

  // Group by user and calculate total smiles and recent smiles
  const userTotals = new Map<string, { totalSmiles: number; recentSmiles: number; fullName: string }>();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  data.forEach(record => {
    const userId = record.user_id;
    const isRecent = new Date(record.created_at) >= threeMonthsAgo;
    const profile = profilesData?.find(p => p.id === userId);
    const current = userTotals.get(userId) || { 
      totalSmiles: 0, 
      recentSmiles: 0, 
      fullName: profile?.full_name || 'Anonymous' 
    };
    
    userTotals.set(userId, {
      totalSmiles: current.totalSmiles + 1,
      recentSmiles: current.recentSmiles + (isRecent ? 1 : 0),
      fullName: current.fullName
    });
  });

  // Convert to array and sort
  const leaderboard = Array.from(userTotals.entries()).map(([userId, data]) => ({
    user_id: userId,
    full_name: data.fullName,
    total_points: data.totalSmiles, // Using total_points field for smiles count
    recent_points: data.recentSmiles, // Recent smiles count
    rank: 0
  }));

  leaderboard.sort((a, b) => b.total_points - a.total_points);

  // Add ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  console.log('Processed leaderboard:', leaderboard);

  return leaderboard;
}

// Get user's rank and surrounding users
export async function getUserRankContext(): Promise<{
  userRank: number;
  surroundingUsers: LeaderboardEntry[];
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const leaderboard = await getDelightLeaderboard();
  
  if (!user) {
    // If no user is authenticated, return the full leaderboard
    return {
      userRank: 0,
      surroundingUsers: leaderboard.slice(0, 5) // Return top 5 users
    };
  }

  const userEntry = leaderboard.find(entry => entry.user_id === user.id);
  
  if (!userEntry) {
    return {
      userRank: 0,
      surroundingUsers: leaderboard.slice(0, 5) // Return top 5 users
    };
  }

  const userRank = userEntry.rank;
  const startIndex = Math.max(0, userRank - 3);
  const endIndex = Math.min(leaderboard.length, userRank + 2);
  
  const surroundingUsers = leaderboard.slice(startIndex, endIndex);

  return {
    userRank,
    surroundingUsers
  };
}

// Debug function to check database state
export async function debugDatabaseState() {
  console.log('=== DEBUGGING DATABASE STATE ===');
  
  // Check delight_tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('delight_tasks')
    .select('*');
  console.log('Delight tasks:', tasks?.length || 0, tasksError);
  
  // Check delight_stories
  const { data: stories, error: storiesError } = await supabase
    .from('delight_stories')
    .select('*');
  console.log('Delight stories:', stories?.length || 0, storiesError);
  
  // Check delight_smiles
  const { data: smiles, error: smilesError } = await supabase
    .from('delight_smiles')
    .select('*');
  console.log('Delight smiles:', smiles?.length || 0, smilesError);
  
  // Check delight_points
  const { data: points, error: pointsError } = await supabase
    .from('delight_points')
    .select('*');
  console.log('Delight points:', points?.length || 0, pointsError);
  
  // Check profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  console.log('Profiles:', profiles?.length || 0, profilesError);
  
  console.log('=== END DEBUG ===');
}
