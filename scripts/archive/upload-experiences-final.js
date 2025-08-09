const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function generateSQLInsert(csvFilePath, outputFile) {
  const experiences = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse categories from JSON string
        let categories = [];
        try {
          categories = JSON.parse(row.categories || '[]');
        } catch (e) {
          categories = [row.categories || 'General'];
        }
        
        // Create experience object
        const experience = {
          title: row.title,
          subtitle: row.subtitle || null,
          description: row.description,
          location: row.location,
          date: row.date || '2024-12-31',
          price: parseFloat(row.price || 0),
          max_guests: parseInt(row.max_guests || 10),
          images: row.images ? JSON.parse(row.images) : [],
          cover_image: row.cover_image,
          duration: row.duration,
          categories: categories,
          is_active: row.is_active === 'TRUE' || row.is_active === 'true',
          host_id: row.host_id || null
        };
        
        experiences.push(experience);
      })
      .on('end', async () => {
        try {
          console.log(`📊 Processing ${experiences.length} experiences...`);
          
          // Generate SQL INSERT statements
          let sqlContent = `-- Disable RLS temporarily for bulk insert\n`;
          sqlContent += `ALTER TABLE experiences DISABLE ROW LEVEL SECURITY;\n\n`;
          sqlContent += `-- Clear existing experiences (optional)\n`;
          sqlContent += `-- DELETE FROM experiences;\n\n`;
          sqlContent += `-- Insert experiences with new columns\n`;
          sqlContent += `INSERT INTO experiences (title, subtitle, description, location, date, price, max_guests, images, cover_image, duration, categories, is_active, host_id) VALUES\n`;
          
          const values = experiences.map(exp => {
            const imagesJson = JSON.stringify(exp.images).replace(/'/g, "''");
            const categoriesJson = JSON.stringify(exp.categories).replace(/'/g, "''");
            return `('${exp.title.replace(/'/g, "''")}', ${exp.subtitle ? `'${exp.subtitle.replace(/'/g, "''")}'` : 'NULL'}, '${exp.description.replace(/'/g, "''")}', '${exp.location.replace(/'/g, "''")}', '${exp.date}', ${exp.price}, ${exp.max_guests}, '${imagesJson}'::text[], '${exp.cover_image}', '${exp.duration}', '${categoriesJson}'::text[], ${exp.is_active}, ${exp.host_id ? `'${exp.host_id}'` : 'NULL'})`;
          });
          
          sqlContent += values.join(',\n') + ';\n\n';
          sqlContent += `-- Re-enable RLS\n`;
          sqlContent += `ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;\n`;
          
          // Write SQL file
          fs.writeFileSync(outputFile, sqlContent);
          
          console.log(`✅ Generated SQL file: ${outputFile}`);
          console.log(`📊 Total experiences to insert: ${experiences.length}`);
          
          console.log('\n💡 Next steps:');
          console.log('1. Run the migration: supabase/migrations/011_update_experiences_table.sql');
          console.log('2. Copy the contents of the SQL file');
          console.log('3. Go to your Supabase dashboard');
          console.log('4. Navigate to SQL Editor');
          console.log('5. Paste and execute the SQL');
          console.log('6. Check the experiences table to verify the data');
          
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
  const outputFile = 'insert-experiences-final.sql';
  
  if (!csvFile) {
    console.log('❌ Please provide a CSV file path');
    console.log('Usage: node scripts/upload-experiences-final.js <path-to-csv>');
    console.log('\nExample: node scripts/upload-experiences-final.js ./experiences-enhanced.csv');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvFile)) {
    console.log(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }
  
  try {
    console.log('🔍 Generating SQL INSERT statements for updated experiences...');
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
