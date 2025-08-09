const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookmarks() {
  console.log('🔍 Testing Bookmarks Functionality...\n');

  try {
    // 1. Check if bookmarks table exists and has data
    console.log('1. Checking bookmarks table...');
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*')
      .limit(5);

    if (bookmarksError) {
      console.error('❌ Error fetching bookmarks:', bookmarksError);
    } else {
      console.log(`✅ Found ${bookmarks?.length || 0} bookmarks in database`);
      if (bookmarks && bookmarks.length > 0) {
        console.log('Sample bookmark:', bookmarks[0]);
      }
    }

    // 2. Check if there are any users
    console.log('\n2. Checking users...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} users`);
      if (profiles && profiles.length > 0) {
        console.log('Sample user:', profiles[0]);
      }
    }

    // 3. Check if there are any properties
    console.log('\n3. Checking properties...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .limit(5);

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
    } else {
      console.log(`✅ Found ${properties?.length || 0} properties`);
      if (properties && properties.length > 0) {
        console.log('Sample property:', properties[0]);
      }
    }

    // 4. Test adding a bookmark (if we have users and properties)
    if (profiles && profiles.length > 0 && properties && properties.length > 0) {
      console.log('\n4. Testing bookmark creation...');
      const testUserId = profiles[0].id;
      const testPropertyId = properties[0].id;

      // Check if bookmark already exists
      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', testUserId)
        .eq('item_id', testPropertyId)
        .eq('item_type', 'property')
        .single();

      if (existingBookmark) {
        console.log('✅ Bookmark already exists for test user and property');
      } else {
        // Try to create a bookmark
        const { data: newBookmark, error: createError } = await supabase
          .from('bookmarks')
          .insert({
            user_id: testUserId,
            item_id: testPropertyId,
            item_type: 'property'
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating bookmark:', createError);
        } else {
          console.log('✅ Successfully created test bookmark:', newBookmark);
        }
      }
    }

    // 5. Check RLS policies
    console.log('\n5. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'bookmarks' });

    if (policiesError) {
      console.log('ℹ️  Could not check RLS policies (this is normal if function does not exist)');
    } else {
      console.log(`ℹ️  Found ${policies?.length || 0} RLS policies for bookmarks table`);
    }

    // 6. Test fetching bookmarks for a specific user
    if (profiles && profiles.length > 0) {
      console.log('\n6. Testing getBookmarks function...');
      const testUserId = profiles[0].id;
      
      const { data: userBookmarks, error: userBookmarksError } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', testUserId);

      if (userBookmarksError) {
        console.error('❌ Error fetching user bookmarks:', userBookmarksError);
      } else {
        console.log(`✅ User ${testUserId} has ${userBookmarks?.length || 0} bookmarks`);
        if (userBookmarks && userBookmarks.length > 0) {
          console.log('User bookmarks:', userBookmarks);
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBookmarks().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 