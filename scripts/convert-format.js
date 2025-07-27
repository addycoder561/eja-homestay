const fs = require('fs');

// Read the existing CSV file
const csvFile = 'property-images.csv';
const outputFile = 'property-images-converted.csv';

if (!fs.existsSync(csvFile)) {
  console.error('❌ property-images.csv not found!');
  console.log('💡 Please run the main script first: npm run generate-images');
  process.exit(1);
}

try {
  console.log('🔄 Converting CSV format...');
  
  // Read the CSV content
  const csvContent = fs.readFileSync(csvFile, 'utf8');
  const lines = csvContent.split('\n');
  
  // Process each line
  const newLines = [];
  newLines.push(lines[0]); // Keep the header
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse the CSV line (handle quotes properly)
    const match = line.match(/^"([^"]+)","(.+)"$/);
    if (match) {
      const propertyId = match[1];
      const imageUrlsString = match[2];
      
      // Convert semicolon-separated URLs to JSON array
      const imageUrls = imageUrlsString.split('; ').filter(url => url.trim());
      const jsonArray = JSON.stringify(imageUrls);
      
      newLines.push(`"${propertyId}","${jsonArray}"`);
    }
  }
  
  // Write the converted file
  fs.writeFileSync(outputFile, newLines.join('\n'));
  
  console.log(`✅ Converted format saved to ${outputFile}`);
  console.log(`📝 New format: ["image1","image2","image3"]`);
  
  // Show a sample
  if (newLines.length > 1) {
    console.log('\n📄 Sample output:');
    console.log(newLines[1]);
  }
  
} catch (error) {
  console.error('❌ Error converting file:', error);
} 