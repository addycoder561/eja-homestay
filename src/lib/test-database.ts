import { supabase } from './supabase';

export async function testDatabaseTables() {
  console.log('🧪 Testing database tables...');
  
  // Test reactions table
  try {
    const { data, error } = await supabase
      .from('reactions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Reactions table error:', error);
      return { reactions: false, follows: false };
    }
    console.log('✅ Reactions table exists');
  } catch (err) {
    console.error('❌ Reactions table test failed:', err);
    return { reactions: false, follows: false };
  }

  // Test follows table
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Follows table error:', error);
      return { reactions: true, follows: false };
    }
    console.log('✅ Follows table exists');
  } catch (err) {
    console.error('❌ Follows table test failed:', err);
    return { reactions: true, follows: false };
  }

  return { reactions: true, follows: true };
}

export async function createMissingTables() {
  console.log('🔧 Creating missing tables...');
  
  // Create reactions table
  const reactionsSQL = `
    CREATE TABLE IF NOT EXISTS reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      item_id UUID NOT NULL,
      item_type TEXT NOT NULL CHECK (item_type IN ('experience', 'retreat')),
      reaction_type TEXT NOT NULL CHECK (reaction_type IN ('wow', 'care')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, item_id, item_type)
    );
  `;

  // Create follows table
  const followsSQL = `
    CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(follower_id, following_id)
    );
  `;

  try {
    // Note: These would need to be run in Supabase SQL editor
    console.log('📝 SQL to create reactions table:');
    console.log(reactionsSQL);
    console.log('📝 SQL to create follows table:');
    console.log(followsSQL);
    
    return { success: true, message: 'Please run the SQL commands in Supabase SQL editor' };
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return { success: false, error: error };
  }
}
