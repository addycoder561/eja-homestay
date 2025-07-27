const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/database.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of google_review_count with google_reviews_count
content = content.replace(/google_review_count/g, 'google_reviews_count');

// Write back to file
fs.writeFileSync(filePath, content);

console.log('✅ Fixed column names in database.ts');
console.log('Changed google_review_count to google_reviews_count'); 