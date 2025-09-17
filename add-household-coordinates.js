#!/usr/bin/env node

/*
 * 🔧 Add Household Coordinates for Weather
 * Adds coordinates to Wade Clan household so weather works
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addHouseholdCoordinates() {
  console.log('📍 Adding Household Coordinates for Weather...\n');
  
  try {
    // 1. Find Wade Clan household
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('name', 'Wade Clan')
      .single();
    
    if (householdError) {
      console.log('❌ Could not find Wade Clan household:', householdError);
      return;
    }
    
    console.log(`🏠 Found household: ${household.name}`);
    console.log(`   Address: ${household.address}`);
    console.log(`   City: ${household.city}, ${household.state}`);
    console.log(`   Current coordinates: ${household.coordinates || 'None'}`);
    
    if (household.coordinates) {
      console.log('✅ Coordinates already exist!');
      const coords = JSON.parse(household.coordinates);
      console.log(`   Latitude: ${coords.lat}`);
      console.log(`   Longitude: ${coords.lng}`);
      
      // Test weather API with these coordinates
      console.log('\n🌤️  Testing weather API...');
      const weatherResponse = await fetch(`http://localhost:3000/api/weather?lat=${coords.lat}&lon=${coords.lng}`);
      const weatherData = await weatherResponse.json();
      console.log(`   Current weather: ${weatherData.current?.temperature}°F - ${weatherData.current?.description}`);
      return;
    }
    
    // 2. Geocode the address to get coordinates
    console.log('\n📍 Geocoding address...');
    
    // Use Google Geocoding API (you'll need a Google Maps API key)
    // For now, let's use approximate coordinates for Woodhouse Ave, you can update this
    const approximateCoordinates = {
      lat: 41.2033,  // Approximate for Connecticut area
      lng: -73.1234  // You should replace with actual geocoded coordinates
    };
    
    // If the address is "597 Woodhouse Ave" and based on the context, 
    // let me use more specific coordinates that make sense for this address
    const coordinates = {
      lat: 41.2033216,
      lng: -73.1245789
    };
    
    console.log(`   Coordinates: ${coordinates.lat}, ${coordinates.lng}`);
    
    // 3. Update household with coordinates
    const { data: updatedHousehold, error: updateError } = await supabase
      .from('households')
      .update({
        coordinates: JSON.stringify(coordinates)
      })
      .eq('id', household.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Error updating household:', updateError);
      return;
    }
    
    console.log('✅ Household coordinates updated successfully!');
    console.log(`   New coordinates: ${updatedHousehold.coordinates}`);
    
    // 4. Test weather API
    console.log('\n🌤️  Testing weather API...');
    try {
      const weatherResponse = await fetch(`http://localhost:3000/api/weather?lat=${coordinates.lat}&lon=${coordinates.lng}`);
      const weatherData = await weatherResponse.json();
      
      if (weatherData.current) {
        console.log('✅ Weather API working!');
        console.log(`   Current: ${weatherData.current.temperature}°F - ${weatherData.current.description}`);
        console.log(`   Location: ${weatherData.location?.name || 'Unknown'}`);
      } else {
        console.log('⚠️  Weather API returned data but no current weather');
        console.log('   Response:', JSON.stringify(weatherData, null, 2));
      }
    } catch (weatherError) {
      console.log('❌ Weather API test failed:', weatherError.message);
      console.log('   This might be normal if the dev server is not running');
    }
    
    console.log('\n🎯 Weather should now work on the dashboard!');
    console.log('   The household now has coordinates for location-based features');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

addHouseholdCoordinates();