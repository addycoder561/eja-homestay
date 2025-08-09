const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

// Price ranges based on experience categories and locations
const PRICE_RANGES = {
  'Mountain': {
    'Immersive': { min: 1500, max: 3500 },
    'Playful': { min: 800, max: 2000 },
    'Culinary': { min: 1200, max: 3000 },
    'Meaningful': { min: 500, max: 1500 }
  },
  'Local': {
    'Immersive': { min: 2000, max: 4000 },
    'Playful': { min: 1000, max: 2500 },
    'Culinary': { min: 1500, max: 3500 },
    'Meaningful': { min: 800, max: 2000 }
  }
};

// Duration estimates based on activity type
const DURATION_ESTIMATES = {
  'Glamp & Gaze': '4-6 hours',
  'Spirits of the Valley': '2-3 hours',
  'The Fire Circle': '3-4 hours',
  'Forest Bathing': '2-3 hours',
  'River Dip': '1-2 hours',
  'Portrait Project': '2-3 hours',
  'Make Your Own Dreamcatcher': '2-3 hours',
  'Gift a Stranger': '1-2 hours',
  'Festival Immersion': '6-8 hours',
  'Birthday': '3-4 hours',
  'Paint the Mountains': '3-4 hours',
  'PUBG': '2-3 hours',
  'Music Festival': '6-8 hours',
  'Karaoke Nights': '3-4 hours',
  'Music Covers': '2-3 hours',
  'Mountain Mic Night': '2-3 hours',
  'Traditional Dance': '2-3 hours',
  'Pottery': '3-4 hours',
  'Bamboo or Jute Craft': '2-3 hours',
  'Puppet Show': '1-2 hours',
  'Art n Craft': '2-3 hours',
  'Theatre': '3-4 hours',
  'Crash Course in Local Language': '2-3 hours',
  'Photography tour': '3-4 hours',
  'Cycling Tour': '4-6 hours',
  'Walking Tour': '2-3 hours',
  'Mystic Trails': '2-3 hours',
  'The Gratitude Trek': '2-3 hours',
  'Heritage Tour': '4-6 hours',
  'Spiritual Tour': '3-4 hours',
  'Farm-to-Table Forage': '3-4 hours',
  'Private Forest Dinner': '3-4 hours',
  'Candlelight Dinner': '2-3 hours',
  'Themed/Casual dining': '2-3 hours',
  'Cooking w/ chef': '3-4 hours',
  'Guest Chef Night': '3-4 hours',
  'Community Potluck': '3-4 hours',
  'Potlucks/Picnics': '4-6 hours',
  'Heritage Recipe Revival': '3-4 hours',
  'Pickle & Preserve Party': '2-3 hours',
  'Sweet-Making': '2-3 hours',
  'Local cuisines tasting': '2-3 hours',
  'Native Food Tasting': '1-2 hours',
  'Street Food Tour': '3-4 hours',
  'Local Spices Tour': '2-3 hours',
  'Gastronomic tours': '6-8 hours',
  'Animal rescue': '3-4 hours',
  'Litter collection': '2-3 hours',
  'Food distribution': '2-3 hours',
  'Celebrating staff birthday': '1-2 hours',
  'Cancer-patient visits': '2-3 hours',
  'Time Volunteering': '3-4 hours'
};

// Image keywords for Unsplash search
const IMAGE_KEYWORDS = {
  'Glamp & Gaze': ['glamping', 'tent', 'mountain', 'stars'],
  'Spirits of the Valley': ['mountain', 'village', 'folklore', 'night'],
  'The Fire Circle': ['campfire', 'fire', 'mountain', 'evening'],
  'Forest Bathing': ['forest', 'nature', 'walking', 'trees'],
  'River Dip': ['river', 'water', 'nature', 'mountain'],
  'Portrait Project': ['portrait', 'photography', 'mountain', 'people'],
  'Make Your Own Dreamcatcher': ['craft', 'dreamcatcher', 'art', 'handmade'],
  'Gift a Stranger': ['gift', 'kindness', 'people', 'community'],
  'Festival Immersion': ['festival', 'celebration', 'culture', 'people'],
  'Birthday': ['birthday', 'celebration', 'cake', 'party'],
  'Paint the Mountains': ['painting', 'art', 'mountain', 'landscape'],
  'PUBG': ['gaming', 'friends', 'technology', 'fun'],
  'Music Festival': ['music', 'festival', 'concert', 'people'],
  'Karaoke Nights': ['karaoke', 'music', 'singing', 'fun'],
  'Music Covers': ['music', 'guitar', 'performance', 'art'],
  'Mountain Mic Night': ['microphone', 'performance', 'mountain', 'evening'],
  'Traditional Dance': ['dance', 'traditional', 'culture', 'performance'],
  'Pottery': ['pottery', 'clay', 'craft', 'art'],
  'Bamboo or Jute Craft': ['bamboo', 'craft', 'handmade', 'art'],
  'Puppet Show': ['puppet', 'theater', 'performance', 'art'],
  'Art n Craft': ['art', 'craft', 'painting', 'creative'],
  'Theatre': ['theater', 'performance', 'stage', 'art'],
  'Crash Course in Local Language': ['language', 'learning', 'books', 'education'],
  'Photography tour': ['photography', 'camera', 'landscape', 'nature'],
  'Cycling Tour': ['cycling', 'bike', 'mountain', 'adventure'],
  'Walking Tour': ['walking', 'city', 'tour', 'exploration'],
  'Mystic Trails': ['mountain', 'trail', 'mystical', 'nature'],
  'The Gratitude Trek': ['hiking', 'mountain', 'nature', 'trail'],
  'Heritage Tour': ['heritage', 'historical', 'architecture', 'culture'],
  'Spiritual Tour': ['temple', 'spiritual', 'meditation', 'peace'],
  'Farm-to-Table Forage': ['farm', 'food', 'garden', 'fresh'],
  'Private Forest Dinner': ['dinner', 'forest', 'candlelight', 'romantic'],
  'Candlelight Dinner': ['dinner', 'candlelight', 'romantic', 'evening'],
  'Themed/Casual dining': ['dining', 'food', 'restaurant', 'meal'],
  'Cooking w/ chef': ['cooking', 'chef', 'kitchen', 'food'],
  'Guest Chef Night': ['cooking', 'kitchen', 'food', 'chef'],
  'Community Potluck': ['potluck', 'food', 'community', 'sharing'],
  'Potlucks/Picnics': ['picnic', 'food', 'nature', 'outdoor'],
  'Heritage Recipe Revival': ['cooking', 'traditional', 'recipe', 'food'],
  'Pickle & Preserve Party': ['preserving', 'food', 'jars', 'traditional'],
  'Sweet-Making': ['dessert', 'sweets', 'cooking', 'traditional'],
  'Local cuisines tasting': ['food', 'tasting', 'local', 'cuisine'],
  'Native Food Tasting': ['food', 'tasting', 'local', 'spices'],
  'Street Food Tour': ['street food', 'food tour', 'local', 'snacks'],
  'Local Spices Tour': ['spices', 'food', 'local', 'market'],
  'Gastronomic tours': ['gastronomy', 'fine dining', 'food', 'luxury'],
  'Animal rescue': ['animals', 'volunteering', 'care', 'compassion'],
  'Litter collection': ['cleaning', 'environment', 'volunteering', 'nature'],
  'Food distribution': ['food', 'charity', 'helping', 'community'],
  'Celebrating staff birthday': ['birthday', 'celebration', 'team', 'joy'],
  'Cancer-patient visits': ['hospital', 'care', 'compassion', 'support'],
  'Time Volunteering': ['volunteering', 'helping', 'community', 'care']
};

// Unsplash image URLs based on keywords
const UNSPLASH_IMAGES = {
  'glamping': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'tent': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'mountain': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'stars': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'village': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
  'folklore': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
  'night': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'campfire': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'fire': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'evening': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'forest': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'nature': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'walking': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'trees': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'river': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
  'water': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
  'portrait': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'photography': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'people': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'craft': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'art': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'handmade': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'gift': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'kindness': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'community': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'festival': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'celebration': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'culture': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'birthday': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'cake': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'party': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'painting': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'landscape': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'gaming': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'friends': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'technology': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'fun': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'music': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'concert': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'karaoke': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'singing': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'guitar': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'performance': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'microphone': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'dance': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'traditional': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'pottery': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'clay': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'bamboo': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'puppet': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'theater': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'stage': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'language': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'learning': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'books': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'education': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'camera': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'cycling': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'bike': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'adventure': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'walking': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'city': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'tour': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'exploration': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'trail': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'mystical': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'hiking': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'heritage': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'historical': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'architecture': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'temple': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'spiritual': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'meditation': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'peace': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'farm': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'food': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'garden': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'fresh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'dinner': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'candlelight': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'romantic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'dining': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'restaurant': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'meal': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'cooking': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'chef': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'kitchen': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'potluck': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'sharing': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'picnic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'outdoor': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'recipe': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'preserving': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'jars': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'dessert': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'sweets': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'tasting': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'cuisine': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'spices': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'market': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'street food': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'food tour': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'snacks': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'gastronomy': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'fine dining': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'luxury': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'animals': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'volunteering': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'care': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'compassion': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'cleaning': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'environment': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
  'charity': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'helping': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'team': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'joy': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'hospital': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'support': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
};

function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getImagesForExperience(title) {
  const keywords = IMAGE_KEYWORDS[title] || ['mountain', 'nature'];
  const images = [];
  
  // Get 3-5 images based on keywords
  keywords.forEach(keyword => {
    if (UNSPLASH_IMAGES[keyword]) {
      images.push(UNSPLASH_IMAGES[keyword]);
    }
  });
  
  // Add some default images if not enough
  if (images.length < 3) {
    images.push('https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800');
    images.push('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800');
  }
  
  return images.slice(0, 5); // Return max 5 images
}

function getCoverImage(title) {
  const keywords = IMAGE_KEYWORDS[title] || ['mountain'];
  for (const keyword of keywords) {
    if (UNSPLASH_IMAGES[keyword]) {
      return UNSPLASH_IMAGES[keyword];
    }
  }
  return 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800';
}

function getPriceForExperience(title, location, categories) {
  // Parse categories if it's a string
  let categoryArray = categories;
  if (typeof categories === 'string') {
    try {
      categoryArray = JSON.parse(categories);
    } catch (e) {
      categoryArray = [categories];
    }
  }
  
  // Determine primary category and location type
  const primaryCategory = categoryArray[0] || 'Mountain';
  const locationType = location.includes('Delhi') ? 'Local' : 'Mountain';
  
  // Get price range
  const priceRange = PRICE_RANGES[locationType]?.[primaryCategory] || 
                    PRICE_RANGES['Mountain']['Playful'];
  
  return getRandomPrice(priceRange.min, priceRange.max);
}

function getDurationForExperience(title) {
  return DURATION_ESTIMATES[title] || '2-3 hours';
}

async function enhanceExperiences(inputFile, outputFile) {
  const experiences = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        // Parse categories
        let categories = row.categories;
        try {
          categories = JSON.parse(categories);
        } catch (e) {
          categories = [categories];
        }
        
        // Get auto-filled values
        const price = getPriceForExperience(row.title, row.location, categories);
        const duration = getDurationForExperience(row.title);
        const images = getImagesForExperience(row.title);
        const coverImage = getCoverImage(row.title);
        
        // Create enhanced row
        const enhancedRow = {
          ...row,
          price: price,
          duration: duration,
          images: JSON.stringify(images),
          cover_image: coverImage
        };
        
        experiences.push(enhancedRow);
      })
      .on('end', async () => {
        try {
          // Create CSV writer
          const csvWriter = createObjectCsvWriter({
            path: outputFile,
            header: [
              { id: 'host_id', title: 'host_id' },
              { id: 'title', title: 'title' },
              { id: 'description', title: 'description' },
              { id: 'location', title: 'location' },
              { id: 'categories', title: 'categories' },
              { id: 'price', title: 'price' },
              { id: 'images', title: 'images' },
              { id: 'cover_image', title: 'cover_image' },
              { id: 'duration', title: 'duration' },
              { id: 'is_active', title: 'is_active' },
              { id: 'created_at', title: 'created_at' },
              { id: 'updated_at', title: 'updated_at' }
            ]
          });
          
          // Write enhanced CSV
          await csvWriter.writeRecords(experiences);
          
          console.log(`✅ Enhanced ${experiences.length} experiences!`);
          console.log(`📁 Output saved to: ${outputFile}`);
          
          // Show sample data
          console.log('\n📋 Sample enhanced experience:');
          console.log(JSON.stringify(experiences[0], null, 2));
          
          resolve(experiences);
        } catch (err) {
          console.error('❌ Error writing CSV:', err);
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
  const inputFile = 'experiences.csv';
  const outputFile = 'experiences-enhanced.csv';
  
  if (!fs.existsSync(inputFile)) {
    console.log(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }
  
  try {
    console.log('🔍 Enhancing experiences with internet data...');
    await enhanceExperiences(inputFile, outputFile);
    
    console.log('\n🎉 Enhancement completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Review the enhanced CSV file');
    console.log('2. Adjust any prices or durations if needed');
    console.log('3. Upload to Supabase using the upload script');
    
  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { enhanceExperiences };
