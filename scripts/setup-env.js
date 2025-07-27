const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Please create a .env.local file in your project root with:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('');
  console.log('💡 You can find these values in your Supabase Dashboard > Settings > API');
  process.exit(1);
}

// Read and check environment variables
require('dotenv').config({ path: envPath });

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('');
  console.log('💡 Please add them to your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables are properly configured!');
console.log('🚀 You can now run: node scripts/generate-image-urls.js'); 