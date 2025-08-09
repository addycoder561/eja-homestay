const fs = require('fs');
const csv = require('csv-parser');

async function generateRetreatsSQL() {
  const retreats = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('retreats-enhanced.csv')
      .pipe(csv())
      .on('data', (row) => {
        retreats.push(row);
      })
      .on('end', () => {
        console.log('🔍 Generating SQL INSERT statements for retreats...');
        console.log(`📊 Processing ${retreats.length} retreats`);
        
        let sqlContent = `-- Disable RLS temporarily for bulk insert
ALTER TABLE retreats DISABLE ROW LEVEL SECURITY;

-- Ensure unique titles to support idempotent inserts
CREATE UNIQUE INDEX IF NOT EXISTS ux_retreats_title ON retreats (title);

-- Clear existing retreats (optional)
-- DELETE FROM retreats;

-- Insert retreats with enhanced data
INSERT INTO retreats (host_id, title, description, location, categories, price, images, cover_image, duration, is_active, created_at, updated_at) VALUES
`;

        const values = retreats.map((retreat) => {
          // Build proper ARRAY[...] for images
          let imageUrls = [];
          try {
            imageUrls = JSON.parse(retreat.images || '[]');
          } catch {
            imageUrls = [];
          }
          const imagesArraySql = `ARRAY[${imageUrls.map((u) => `'${String(u).replace(/'/g, "''")}'`).join(', ')}]`;

          const description = (retreat.description || '').replace(/'/g, "''");
          const title = (retreat.title || '').replace(/'/g, "''");
          const location = (retreat.location || '').replace(/'/g, "''");
          const categories = (retreat.categories || '').replace(/'/g, "''");
          const duration = (retreat.duration || '').replace(/'/g, "''");
          const coverImage = (retreat.cover_image || '').replace(/'/g, "''");
          const isActiveLiteral = String(retreat.is_active).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
          const hostIdLiteral = retreat.host_id && retreat.host_id.trim() !== '' ? `'${retreat.host_id.replace(/'/g, "''")}'` : 'NULL';

          return `(${hostIdLiteral}, '${title}', '${description}', '${location}', '${categories}', ${retreat.price || 0}, ${imagesArraySql}, '${coverImage}', '${duration}', ${isActiveLiteral}, NOW(), NOW())`;
        });

        // Add ON CONFLICT to make inserts idempotent
        sqlContent += values.join(',\n') + '\nON CONFLICT (title) DO NOTHING;';

        sqlContent += `

-- Re-enable RLS
ALTER TABLE retreats ENABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT title, price, duration, categories FROM retreats ORDER BY created_at DESC;
`;

        // Write SQL file
        fs.writeFileSync('insert-retreats.sql', sqlContent);
        
        console.log('✅ Generated SQL file: insert-retreats.sql');
        console.log(`📊 Total retreats to insert: ${retreats.length}`);
        
        console.log('\n💡 Next steps:');
        console.log('1. Copy the contents of insert-retreats.sql');
        console.log('2. Paste into Supabase SQL Editor');
        console.log('3. Execute the script');
        console.log('4. Verify data in retreats table');
        
        console.log('\n🎯 Retreat Categories:');
        const categories = [...new Set(retreats.map(r => r.categories))];
        categories.forEach(cat => {
          const count = retreats.filter(r => r.categories === cat).length;
          console.log(`- ${cat}: ${count} retreats`);
        });
        
        console.log('\n💰 Price Range:');
        const prices = retreats.map(r => parseInt(r.price));
        console.log(`- Min: ₹${Math.min(...prices)}`);
        console.log(`- Max: ₹${Math.max(...prices)}`);
        console.log(`- Average: ₹${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}`);
        
        resolve();
      })
      .on('error', reject);
  });
}

generateRetreatsSQL().catch(console.error);
