const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Default values for auto-filled columns
const DEFAULT_VALUES = {
  host_id: null, // You can set a specific host_id here if needed
  subtitle: null,
  max_guests: 10,
  images: ['https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80'],
  is_active: true
};

async function uploadExperiences(csvFilePath) {
  const experiences = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Transform CSV row to match database structure
        const experience = {
          title: row.title || row.Title || row.name || row.Name,
          subtitle: row.subtitle || row.Subtitle || row.sub_title || DEFAULT_VALUES.subtitle,
          description: row.description || row.Description || row.desc || row.details,
          location: row.location || row.Location || row.city || row.City,
          date: row.date || row.Date || row.event_date || row.eventDate || '2024-12-31', // Default date if missing
          price: parseFloat(row.price || row.Price || row.cost || row.Cost || 0),
          max_guests: parseInt(row.max_guests || row.maxGuests || row.Max_Guests || row.capacity || DEFAULT_VALUES.max_guests),
          images: row.images ? JSON.parse(row.images) : DEFAULT_VALUES.images,
          is_active: row.is_active !== undefined ? row.is_active === 'TRUE' || row.is_active === 'true' : DEFAULT_VALUES.is_active,
          host_id: row.host_id || row.hostId || DEFAULT_VALUES.host_id
        };
        
        experiences.push(experience);
      })
      .on('end', async () => {
        try {
          console.log(`📊 Processing ${experiences.length} experiences...`);
          
          // Upload to Supabase
          const { data, error } = await supabase
            .from('experiences')
            .insert(experiences)
            .select();
          
          if (error) {
            console.error('❌ Error uploading experiences:', error);
            reject(error);
            return;
          }
          
          console.log(`✅ Successfully uploaded ${data.length} experiences!`);
          console.log('\n📋 Sample uploaded experience:');
          console.log(JSON.stringify(data[0], null, 2));
          
          resolve(data);
        } catch (err) {
          console.error('❌ Error:', err);
          reject(err);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Function to validate CSV structure
function validateCSVStructure(csvFilePath) {
  return new Promise((resolve, reject) => {
    const headers = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        if (headers.length === 0) {
          headers.push(...Object.keys(row));
        }
      })
      .on('end', () => {
        console.log('📋 CSV Headers found:', headers);
        resolve(headers);
      })
      .on('error', reject);
  });
}

// Main execution
async function main() {
  const csvFile = process.argv[2] || 'experiences-enhanced.csv';
  
  if (!csvFile) {
    console.log('❌ Please provide a CSV file path');
    console.log('Usage: node scripts/upload-experiences.js <path-to-csv>');
    console.log('\nExample: node scripts/upload-experiences.js ./experiences-enhanced.csv');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvFile)) {
    console.log(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }
  
  try {
    console.log('🔍 Validating CSV structure...');
    const headers = await validateCSVStructure(csvFile);
    
    console.log('📤 Starting upload...');
    await uploadExperiences(csvFile);
    
    console.log('\n🎉 Upload completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Check your Supabase dashboard to verify the data');
    console.log('2. Update any missing host_id values if needed');
    console.log('3. Add proper images to the experiences');
    console.log('4. Update the experiences table schema if needed');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { uploadExperiences, validateCSVStructure };
