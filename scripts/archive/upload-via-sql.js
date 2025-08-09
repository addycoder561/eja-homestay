const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Default values for auto-filled columns
const DEFAULT_VALUES = {
  host_id: null, // You can set a specific host_id here if needed
  subtitle: null,
  max_guests: 10,
  images: ['https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80'],
  is_active: true
};

async function generateSQLInsert(csvFilePath, outputFile) {
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
          
          // Generate SQL INSERT statements
          let sqlContent = `-- Disable RLS temporarily for bulk insert\n`;
          sqlContent += `ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;\n\n`;
          sqlContent += `-- Insert experiences\n`;
          sqlContent += `INSERT INTO experiences (title, subtitle, description, location, date, price, max_guests, images, is_active, host_id) VALUES\n`;
          
          const values = experiences.map(exp => {
            const imagesJson = JSON.stringify(exp.images).replace(/'/g, "''");
            return `('${exp.title.replace(/'/g, "''")}', ${exp.subtitle ? `'${exp.subtitle.replace(/'/g, "''")}'` : 'NULL'}, '${exp.description.replace(/'/g, "''")}', '${exp.location.replace(/'/g, "''")}', '${exp.date}', ${exp.price}, ${exp.max_guests}, '${imagesJson}'::text[], ${exp.is_active}, ${exp.host_id ? `'${exp.host_id}'` : 'NULL'})`;
          });
          
          sqlContent += values.join(',\n') + ';\n\n';
          sqlContent += `-- Re-enable RLS\n`;
          sqlContent += `ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;\n`;
          
          // Write SQL file
          fs.writeFileSync(outputFile, sqlContent);
          
          console.log(`✅ Generated SQL file: ${outputFile}`);
          console.log(`📊 Total experiences to insert: ${experiences.length}`);
          
          console.log('\n💡 Next steps:');
          console.log('1. Copy the contents of the SQL file');
          console.log('2. Go to your Supabase dashboard');
          console.log('3. Navigate to SQL Editor');
          console.log('4. Paste and execute the SQL');
          console.log('5. Check the experiences table to verify the data');
          
          resolve(experiences);
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

// Main execution
async function main() {
  const csvFile = process.argv[2] || 'experiences-enhanced.csv';
  const outputFile = 'insert-experiences.sql';
  
  if (!csvFile) {
    console.log('❌ Please provide a CSV file path');
    console.log('Usage: node scripts/upload-via-sql.js <path-to-csv>');
    console.log('\nExample: node scripts/upload-via-sql.js ./experiences-enhanced.csv');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvFile)) {
    console.log(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }
  
  try {
    console.log('🔍 Generating SQL INSERT statements...');
    await generateSQLInsert(csvFile, outputFile);
    
    console.log('\n🎉 SQL generation completed successfully!');
    
  } catch (error) {
    console.error('❌ SQL generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateSQLInsert };
