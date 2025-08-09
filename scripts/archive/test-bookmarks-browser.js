// Browser Console Test Script for Bookmarks
// Copy and paste this into your browser console on http://localhost:3001

console.log('🔍 Testing Bookmarks in Browser Console...');

// Test 1: Check if user is authenticated
async function testUserAuth() {
  console.log('\n1. Testing User Authentication...');
  
  // Get the current user from localStorage or session
  const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
  console.log('Current user token:', user);
  
  // Check if we can access the auth context
  if (window.__NEXT_DATA__) {
    console.log('Next.js data available');
  }
  
  return user;
}

// Test 2: Test adding a bookmark
async function testAddBookmark() {
  console.log('\n2. Testing Add Bookmark...');
  
  // Get a property ID from the current page
  const propertyCards = document.querySelectorAll('[href*="/property/"]');
  if (propertyCards.length > 0) {
    const firstProperty = propertyCards[0];
    const href = firstProperty.getAttribute('href');
    const propertyId = href.split('/property/')[1];
    console.log('Found property ID:', propertyId);
    
    // Try to add a bookmark
    try {
      const response = await fetch('/api/bookmarks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: propertyId,
          itemType: 'property'
        })
      });
      
      const result = await response.json();
      console.log('Add bookmark result:', result);
      return result;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  } else {
    console.log('No property cards found on this page');
    return null;
  }
}

// Test 3: Test getting bookmarks
async function testGetBookmarks() {
  console.log('\n3. Testing Get Bookmarks...');
  
  try {
    const response = await fetch('/api/bookmarks');
    const result = await response.json();
    console.log('Get bookmarks result:', result);
    return result;
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return null;
  }
}

// Test 4: Direct Supabase test
async function testSupabaseDirect() {
  console.log('\n4. Testing Supabase Direct...');
  
  // This assumes Supabase client is available globally
  if (window.supabase) {
    try {
      const { data, error } = await window.supabase
        .from('bookmarks')
        .select('*')
        .limit(5);
      
      console.log('Direct Supabase bookmarks:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Direct Supabase error:', error);
      return { data: null, error };
    }
  } else {
    console.log('Supabase client not available globally');
    return { data: null, error: 'No Supabase client' };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Bookmarks Tests...\n');
  
  const user = await testUserAuth();
  const addResult = await testAddBookmark();
  const getResult = await testGetBookmarks();
  const supabaseResult = await testSupabaseDirect();
  
  console.log('\n📊 Test Summary:');
  console.log('- User authenticated:', !!user);
  console.log('- Add bookmark success:', !!addResult);
  console.log('- Get bookmarks success:', !!getResult);
  console.log('- Direct Supabase success:', !supabaseResult.error);
  
  return {
    user,
    addResult,
    getResult,
    supabaseResult
  };
}

// Export for manual testing
window.testBookmarks = runAllTests;
console.log('✅ Test functions loaded. Run: testBookmarks()'); 