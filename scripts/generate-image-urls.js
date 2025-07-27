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
}

// Check if environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables not found!');
  console.log('📝 Please make sure you have a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Configuration
const BUCKET_NAME = 'property-images'; // Change this to your actual bucket name
const OUTPUT_FILE = 'property-images.json';

// Debug information
console.log('🔧 Configuration:');
console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
console.log(`   Bucket Name: ${BUCKET_NAME}`);
console.log(`   Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('');

async function getAllImagesFromFolders() {
  try {
    console.log('🚀 Starting to fetch images from Supabase Storage...');
    
    // First, let's list all folders in the bucket
    const { data: folders, error: foldersError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });
    
    if (foldersError) {
      console.error('❌ Error listing folders:', foldersError);
      return;
    }
    
    console.log(`📁 Found ${folders.length} folders in storage`);
    
    const propertyImages = {};
    
    // Process each folder
    for (const folder of folders) {
      if (folder.name && !folder.metadata) { // Skip files, only process folders
        console.log(`📂 Processing folder: ${folder.name}`);
        
        // List all files in this folder
        const { data: files, error: filesError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folder.name, { limit: 1000 });
        
        if (filesError) {
          console.error(`❌ Error listing files in ${folder.name}:`, filesError);
          continue;
        }
        
        // Filter for image files and generate URLs
        const imageFiles = files.filter(file => 
          file.name && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
        );
        
        const imageUrls = imageFiles.map(file => {
          const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(`${folder.name}/${file.name}`);
          return data.publicUrl;
        });
        
        propertyImages[folder.name] = {
          folderName: folder.name,
          imageCount: imageUrls.length,
          images: imageUrls
        };
        
        console.log(`✅ ${folder.name}: ${imageUrls.length} images found`);
      }
    }
    
    // Save results to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(propertyImages, null, 2));
    
    console.log(`\n🎉 Success! Results saved to ${OUTPUT_FILE}`);
    console.log(`📊 Summary:`);
    
    Object.entries(propertyImages).forEach(([folder, data]) => {
      console.log(`   ${folder}: ${data.imageCount} images`);
    });
    
    // Generate CSV format for spreadsheet
    generateCSV(propertyImages);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function generateCSV(propertyImages) {
  const csvContent = ['Property ID,Image URLs\n'];
  
  Object.entries(propertyImages).forEach(([folder, data]) => {
    // Format as JSON array: ["image1","image2","image3"]
    const imageUrlsArray = JSON.stringify(data.images);
    csvContent.push(`"${folder}","${imageUrlsArray}"`);
  });
  
  const csvFile = 'property-images.csv';
  fs.writeFileSync(csvFile, csvContent.join('\n'));
  
  console.log(`📄 CSV format saved to ${csvFile}`);
  console.log(`💡 You can now copy the Image URLs column directly to your spreadsheet!`);
  console.log(`📝 Format: ["image1","image2","image3"]`);
}

// Run the script
getAllImagesFromFolders(); 