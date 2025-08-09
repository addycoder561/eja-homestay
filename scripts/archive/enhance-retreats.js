const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Retreat data with auto-filled information
const retreatData = {
  'First Love Retreat': {
    price: 2499,
    duration: '3 days, 2 nights',
    description: 'A romantic escape for young couples experiencing their first journey together. Features curated bonding games, sunrise treks, love letter writing sessions, and intimate moments in the mountains.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Patch-Up Retreat': {
    price: 2999,
    duration: '3 days, 2 nights',
    description: 'A healing space for couples mending their love stories. Includes therapeutic healing rituals, guided solo reflection sessions, and playful group activities to rebuild trust and connection.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Break-Up Retreat': {
    price: 1999,
    duration: '3 days, 2 nights',
    description: 'A supportive environment for those healing from recent break-ups. Features therapeutic healing rituals, guided solo reflection, and gentle group activities to foster self-love and growth.',
    cover_image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
    images: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]
  },
  'First Solo Retreat': {
    price: 1799,
    duration: '3 days, 2 nights',
    description: 'Perfect for hesitant first-time solo travelers. Features gentle group integration activities, "my story" reflection circles, and supportive community building in a safe mountain environment.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'First Trip Retreat': {
    price: 1599,
    duration: '3 days, 2 nights',
    description: 'An empowering journey for first-time travelers seeking adventure and self-discovery. Features guided mountain exploration, confidence-building activities, and meaningful connections with fellow adventurers.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Pet Parent Retreat': {
    price: 2299,
    duration: '3 days, 2 nights',
    description: 'A unique retreat for pet parents and their furry companions. Features pet-friendly trails, agility courses, doggo ice-cream nights, and professional grooming sessions in the mountains.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Family Getaways': {
    price: 3499,
    duration: '3 days, 2 nights',
    description: 'Perfect for families of all shapes and sizes. Features treasure hunts, family bonding circles, unplugged moments of togetherness, and activities designed for all age groups.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Wellness Retreat': {
    price: 3999,
    duration: '4 days, 3 nights',
    description: 'A comprehensive wellness experience featuring breathwork sessions, body movement classes, forest bathing, and soul-nourishing food. Includes spa treatments, yoga, and zumba sessions.',
    cover_image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
    images: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]
  },
  'Silent Retreat': {
    price: 2799,
    duration: '3 days, 2 nights',
    description: 'A transformative experience of complete silence - no phones, no noise. Features guided forest walks, journaling sessions, stargazing with folk tales, and deep inner reflection.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Senior Citizen Retreat': {
    price: 1999,
    duration: '3 days, 2 nights',
    description: 'Specially designed for senior citizens seeking calm, connection, and wonder. Features gentle slow walks, story circles, tea sessions with mountain views, and age-appropriate activities.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Re-unions Retreat': {
    price: 2999,
    duration: '3 days, 2 nights',
    description: 'Perfect for college or school reunions. Features memory trails, time capsule creation, goofy talent nights, and activities designed to rekindle old friendships and create new memories.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Sibling Reconnect Retreat': {
    price: 2499,
    duration: '3 days, 2 nights',
    description: 'A special retreat designed to help siblings bond after growing-up years. Features goofy games, memory walks, shared letter writing, and activities to strengthen sibling relationships.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Cousins Meetup Retreat': {
    price: 2699,
    duration: '3 days, 2 nights',
    description: 'A joyful gathering for cousins to reconnect and create lasting memories. Features group activities, shared storytelling, outdoor adventures, and bonding experiences in the mountains.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Sabattical Retreat (Professionals)': {
    price: 4499,
    duration: '5 days, 4 nights',
    description: 'For professionals navigating work-life crossroads. Features skill swap sessions, mindful morning routines, big-question discussions, and space for career reflection and planning.',
    cover_image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
    images: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]
  },
  'Corporate Retreat': {
    price: 3999,
    duration: '3 days, 2 nights',
    description: 'Designed for teams to shed stress and build stronger bonds. Features trust games, wild idea brainstorming sessions, and open discussions under the mountain sky.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Adventure Retreat': {
    price: 3299,
    duration: '4 days, 3 nights',
    description: 'For thrill-seekers and adventure enthusiasts. Features canyon dips, forest runs, high climbs, and low-stress storytelling under the stars with experienced guides.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Cancer/last-stage patient Retreat': {
    price: 1999,
    duration: '3 days, 2 nights',
    description: 'A supportive retreat for cancer survivors and patients. Features body-positive healing sessions, laughter therapy, and celebration of resilience in a nurturing mountain environment.',
    cover_image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
    images: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]
  },
  'Single Parent Retreat': {
    price: 2299,
    duration: '3 days, 2 nights',
    description: 'Designed to celebrate and support brave single parents. Features joint DIY sessions with children, solo self-care time, and community building with other single parents.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Midlife Magic Retreat': {
    price: 2799,
    duration: '3 days, 2 nights',
    description: 'For the 35-50 age group rediscovering joy and purpose. Features dancing sessions, journaling workshops, mountain biking, and "My Next Chapter" planning activities.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Empty Nester Retreat': {
    price: 2499,
    duration: '3 days, 2 nights',
    description: 'For parents rediscovering freedom after children leave home. Curated for nostalgia, peace, and finding new purpose in this beautiful phase of life.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Second Innings Retreat': {
    price: 2999,
    duration: '4 days, 3 nights',
    description: 'For people starting fresh - post-divorce, post-career-break, post-sobriety. A sacred space to reset, reflect, and plan your second innings with renewed energy.',
    cover_image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
    images: [
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  },
  'Letting Go Retreat': {
    price: 2599,
    duration: '3 days, 2 nights',
    description: 'A safe space for those grieving loss - of people, dreams, or identity. Features soulful sessions, guided silence walks, and therapeutic activities for healing and acceptance.',
    cover_image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
    images: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]
  },
  'Incomplete dreams Retreat': {
    price: 3199,
    duration: '4 days, 3 nights',
    description: 'A transformative retreat for those seeking to complete unfinished dreams and aspirations. Features goal-setting workshops, dream visualization sessions, and action planning to turn dreams into reality.',
    cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800'
    ]
  }
};

async function enhanceRetreats() {
  const retreats = [];
  
  // Read the CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream('retreats.csv')
      .pipe(csv())
      .on('data', (row) => {
        const title = row.title;
        const retreatInfo = retreatData[title];
        
        if (retreatInfo) {
          // Update the row with enhanced data
          row.price = retreatInfo.price;
          row.duration = retreatInfo.duration;
          row.images = JSON.stringify(retreatInfo.images);
          row.cover_image = retreatInfo.cover_image;
          
          // Only update description if it's empty or for specific retreats
          if (!row.description || row.description.trim() === '' || 
              title === 'First Trip Retreat' || 
              title === 'Cousins Meetup Retreat' || 
              title === 'Incomplete dreams Retreat') {
            row.description = retreatInfo.description;
          }
        }
        
        retreats.push(row);
      })
      .on('end', () => {
        // Write the enhanced data back to CSV
        const csvWriter = createCsvWriter({
          path: 'retreats-enhanced.csv',
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
        
        csvWriter.writeRecords(retreats)
          .then(() => {
            console.log('✅ Enhanced retreats data written to retreats-enhanced.csv');
            console.log(`📊 Processed ${retreats.length} retreats`);
            console.log('\n🎯 Enhanced data includes:');
            console.log('- Price: ₹1,599 - ₹4,499 based on retreat type');
            console.log('- Duration: 3-5 days with appropriate lengths');
            console.log('- Images: High-quality Unsplash URLs');
            console.log('- Cover Images: Primary display images');
            console.log('- Descriptions: Detailed, engaging descriptions');
            console.log('\n💡 Next steps:');
            console.log('1. Review retreats-enhanced.csv');
            console.log('2. Upload to Supabase trips table');
            console.log('3. Update frontend to display retreats');
          })
          .catch(reject);
      })
      .on('error', reject);
  });
}

enhanceRetreats().catch(console.error);
