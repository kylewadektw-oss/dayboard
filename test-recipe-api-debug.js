/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Test Recipe API Connection
 */

async function testRecipeAPI() {
  console.log('🍳 Testing Recipe API Connection...\n');

  try {
    console.log('1. Testing direct API endpoint...');
    
    const response = await fetch('/api/recipes/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery: 'chicken',
        numberOfRecipes: 5
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response Success:', data);

    // Test the recipe fetcher utility
    console.log('\n2. Testing recipe fetcher utility...');
    
    const { fetchRecipesFromAPI } = await import('./utils/supabase/recipe-fetcher.js');
    
    const result = await fetchRecipesFromAPI({
      searchQuery: 'pasta',
      numberOfRecipes: 3
    });
    
    console.log('✅ Recipe Fetcher Result:', result);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run in browser context
if (typeof window !== 'undefined') {
  testRecipeAPI();
} else {
  console.log('Run this in browser console or as a client-side test');
}
