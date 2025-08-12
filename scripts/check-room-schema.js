import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRoomSchema() {
  try {
    console.log('🔍 Checking room schema...');
    
    // Fetch a sample room to see what columns exist
    const { data: rooms, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching rooms:', fetchError);
      return;
    }
    
    if (rooms && rooms.length > 0) {
      const room = rooms[0];
      console.log('📋 Room columns found:');
      console.log(Object.keys(room));
      console.log('\n📋 Sample room data:');
      console.log(JSON.stringify(room, null, 2));
    } else {
      console.log('❌ No rooms found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
checkRoomSchema();
