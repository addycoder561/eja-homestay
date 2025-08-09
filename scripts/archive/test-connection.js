const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load .env.local from multiple possible locations
const envPaths = [
  '.env.local',
  '../.env.local',
  '../../.env.local',
  path.join(__dirname, '.env.local'),
  path.join(__dirname, '../.env.local')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`✅ Loaded environment from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.log('⚠️  No .env.local file found in common locations');
  process.exit(1);
}

// Check if environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables not found!');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    console.log('🔧 Testing Supabase connection...');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`);
    console.log('');

    // Test 1: List all buckets
    console.log('📦 Testing bucket listing...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Buckets found:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    console.log('');

    // Test 2: Try to access the specific bucket
    const BUCKET_NAME = 'property-images';
    console.log(`📁 Testing access to bucket: ${BUCKET_NAME}`);
    
    const { data: files, error: filesError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 10 });
    
    if (filesError) {
      console.error(`❌ Error accessing bucket '${BUCKET_NAME}':`, filesError);
      console.log('');
      console.log('💡 Possible solutions:');
      console.log('   1. Check if the bucket name is correct');
      console.log('   2. Verify bucket permissions in Supabase Dashboard');
      console.log('   3. Check if bucket is public or private');
      return;
    }
    
    console.log(`✅ Successfully accessed bucket '${BUCKET_NAME}'`);
    console.log(`📊 Found ${files.length} items in root:`);
    files.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata ? 'file' : 'folder'})`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection(); 