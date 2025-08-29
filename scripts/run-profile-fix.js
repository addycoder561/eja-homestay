const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runProfileFix() {
  try {
    console.log('🔧 Starting profile fix script...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'fix-profiles-complete.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔍 Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          if (data) {
            console.log('📋 Result:', data);
          }
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎉 Profile fix script completed!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function runProfileFixDirect() {
  try {
    console.log('🔧 Starting direct profile fix...');
    
    // First, let's check current profile data
    console.log('\n📊 Checking current profile data...');
    const { data: currentProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'adityawardhanaryavanshi@gmail.com')
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', selectError);
    } else {
      console.log('📋 Current profile:', currentProfile);
    }
    
    // Update or insert profile
    console.log('\n🔧 Updating profile data...');
    const { data: upsertResult, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: '985c70b3-0d69-4690-8f9a-4d800184839c',
        email: 'adityawardhanaryavanshi@gmail.com',
        full_name: 'Aditya Arya',
        is_host: false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (upsertError) {
      console.error('❌ Error upserting profile:', upsertError);
    } else {
      console.log('✅ Profile updated successfully:', upsertResult);
    }
    
    // Enable RLS
    console.log('\n🔧 Enabling RLS on profiles table...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled successfully');
    }
    
    // Create policies
    const policies = [
      {
        name: 'Users can view their own profile',
        sql: `CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);`
      },
      {
        name: 'Users can update their own profile',
        sql: `CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`
      },
      {
        name: 'Users can insert their own profile',
        sql: `CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`
      },
      {
        name: 'Public profiles are viewable by everyone',
        sql: `CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);`
      }
    ];
    
    for (const policy of policies) {
      console.log(`\n🔧 Creating policy: ${policy.name}`);
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.sql });
      
      if (policyError) {
        console.error(`❌ Error creating policy "${policy.name}":`, policyError);
      } else {
        console.log(`✅ Policy "${policy.name}" created successfully`);
      }
    }
    
    // Verify final state
    console.log('\n📊 Verifying final profile data...');
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'adityawardhanaryavanshi@gmail.com')
      .single();
    
    if (finalError) {
      console.error('❌ Error checking final profile:', finalError);
    } else {
      console.log('✅ Final profile data:', finalProfile);
    }
    
    console.log('\n🎉 Profile fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (process.argv.includes('--direct')) {
  runProfileFixDirect();
} else {
  runProfileFix();
}
