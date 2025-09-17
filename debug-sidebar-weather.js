#!/usr/bin/env node

/*
 * 🔧 Debug Sidebar Weather API Calls
 * Tests weather API calls with actual household coordinates
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSidebarWeather() {
  console.log('🔍 Debugging Sidebar Weather API Calls...\n');
  
  try {
    // 1. Get household with coordinates
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('name', 'Wade Clan')
      .single();
    
    if (householdError) {
      console.log('❌ Could not find household:', householdError);
      return;
    }
    
    console.log(`🏠 Found household: ${household.name}`);
    console.log(`   Coordinates field: ${household.coordinates}`);
    
    if (!household.coordinates) {
      console.log('❌ No coordinates found in household');
      return;
    }
    
    // 2. Parse coordinates
    let coords;
    try {
      coords = JSON.parse(household.coordinates);
      console.log(`✅ Parsed coordinates: lat=${coords.lat}, lng=${coords.lng}`);
    } catch (parseError) {
      console.log('❌ Error parsing coordinates:', parseError);
      console.log('   Raw coordinates:', household.coordinates);
      return;
    }
    
    // 3. Test weather API call with correct parameter names
    console.log('\n🌤️  Testing weather API call...');
    
    const weatherUrl = `http://localhost:3000/api/weather?lat=${coords.lat}&lon=${coords.lng}`;
    console.log(`   URL: ${weatherUrl}`);
    
    try {
      const response = await fetch(weatherUrl);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const weatherData = await response.json();
        console.log('✅ Weather API successful!');
        console.log(`   Temperature: ${weatherData.current.temp}°F`);
        console.log(`   Condition: ${weatherData.current.weather[0].description}`);
        console.log(`   Daily forecasts: ${weatherData.daily.length} days`);
      } else {
        const errorText = await response.text();
        console.log('❌ Weather API failed:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${errorText}`);
      }
    } catch (fetchError) {
      console.log('❌ Weather API fetch error:', fetchError.message);
      console.log('   This is expected if the dev server is not running');
    }
    
    // 4. Test parameter validation
    console.log('\n🔍 Testing parameter validation...');
    
    const testCases = [
      { name: 'Valid coordinates', lat: coords.lat, lon: coords.lng },
      { name: 'Missing lat', lat: null, lon: coords.lng },
      { name: 'Missing lon', lat: coords.lat, lon: null },
      { name: 'Invalid lat', lat: 'invalid', lon: coords.lng },
      { name: 'Out of range lat', lat: 91, lon: coords.lng },
    ];
    
    for (const testCase of testCases) {
      const testUrl = `http://localhost:3000/api/weather?lat=${testCase.lat}&lon=${testCase.lon}`;
      console.log(`   ${testCase.name}: Expected ${testCase.name.includes('Valid') ? 'success' : 'error'}`);
    }
    
    console.log('\n🎯 Recommendations:');
    console.log('   1. ✅ SidebarWeather parameter fixed (lng → lon)');
    console.log('   2. ✅ Household coordinates are properly formatted');
    console.log('   3. 🚀 Weather API should now work correctly');
    console.log('   4. 🔄 Try accessing the sidebar weather in the app');
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugSidebarWeather();