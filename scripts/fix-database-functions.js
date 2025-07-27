const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/database.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic lines that copy Google data to platform fields
content = content.replace(
  /average_rating: property\.google_rating \|\| 0, \/\/ Use Google rating instead/g,
  'average_rating: property.average_rating || 0, // Keep original platform rating'
);

content = content.replace(
  /review_count: property\.google_reviews_count \|\| 0 \/\/ Use Google review count instead/g,
  'review_count: property.review_count || 0 // Keep original platform review count'
);

// Also fix the getPropertyWithReviews function
content = content.replace(
  /average_rating: data\.google_rating \|\| 0, \/\/ Use Google rating instead/g,
  'average_rating: data.average_rating || 0, // Keep original platform rating'
);

content = content.replace(
  /review_count: data\.google_reviews_count \|\| 0 \/\/ Use Google review count instead/g,
  'review_count: data.review_count || 0 // Keep original platform review count'
);

// Update comments
content = content.replace(
  /\/\/ Use Google ratings instead of calculating from reviews/g,
  '// Keep original platform ratings separate from Google ratings'
);

// Write back to file
fs.writeFileSync(filePath, content);

console.log('✅ Fixed database functions to keep platform and Google ratings separate');
console.log('Changed functions to use original platform data instead of copying Google data'); 