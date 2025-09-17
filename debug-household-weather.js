/*
 * Debug Household Weather Issue
 * 
 * This script checks if household coordinates are properly saved
 * and if the weather API can fetch data correctly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugHouseholdWeather() {
  console.log('🔍 Debugging Household Weather Integration...\n');

  try {
    // Check all households
    console.log('📋 Fetching all households...');
    const { data: households, error: householdsError } = await supabase
      .from('households')
      .select('id, name, address, city, state, zip, coordinates');

    if (householdsError) {
      console.error('❌ Error fetching households:', householdsError);
      return;
    }

    if (!households || households.length === 0) {
      console.log('📭 No households found in database');
      return;
    }

    console.log(`✅ Found ${households.length} household(s):\n`);

    for (const household of households) {
      console.log(`🏠 Household: ${household.name || 'Unnamed'}`);
      console.log(`   ID: ${household.id}`);
      console.log(`   Address: ${household.address || 'Not set'}`);
      console.log(`   City: ${household.city || 'Not set'}`);
      console.log(`   State: ${household.state || 'Not set'}`);
      console.log(`   ZIP: ${household.zip || 'Not set'}`);
      
      // Check coordinates
      if (household.coordinates) {
        try {
          const coords = JSON.parse(household.coordinates);
          console.log(`   📍 Coordinates: lat=${coords.lat}, lng=${coords.lng}`);
          
          // Test weather API call
          console.log('   🌤️  Testing weather API...');
          const response = await fetch(
            `http://localhost:3000/api/weather?lat=${coords.lat}&lon=${coords.lng}`
          );
          
          if (response.ok) {
            const weatherData = await response.json();
            console.log(`   ✅ Weather: ${weatherData.current.temp}°F, ${weatherData.current.weather[0].description}`);
          } else {
            console.log(`   ❌ Weather API failed: ${response.status} ${response.statusText}`);
          }
        } catch (parseError) {
          console.log(`   ❌ Invalid coordinates format: ${household.coordinates}`);
        }
      } else {
        console.log('   ❌ No coordinates set');
        
        // If we have address info, suggest geocoding
        if (household.address && household.city && household.state) {
          console.log('   💡 Address available - coordinates should be geocoded');
        } else {
          console.log('   💡 No address information - need to set household address');
        }
      }
      
      console.log(''); // Empty line between households
    }

    // Check profiles to see which household users belong to
    console.log('👥 Checking user profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, household_id')
      .not('household_id', 'is', null);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else if (profiles) {
      console.log(`✅ Found ${profiles.length} users with households:\n`);
      for (const profile of profiles) {
        const household = households.find(h => h.id === profile.household_id);
        console.log(`👤 ${profile.name || 'Unnamed'} → 🏠 ${household?.name || 'Unknown household'}`);
      }
    }

  } catch (error) {
    console.error('💥 Error during debugging:', error);
  }
}

// Test external weather API directly
async function testWeatherAPI() {
  console.log('\n🌍 Testing OpenMeteo API directly...');
  
  // Test with San Francisco coordinates
  const testLat = 37.7749;
  const testLon = -122.4194;
  
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${testLat}&longitude=${testLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`;
    
    console.log('📡 Making API call to OpenMeteo...');
    const response = await fetch(weatherUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ External API works: ${Math.round(data.current.temperature_2m)}°F`);
    } else {
      console.log(`❌ External API failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ External API error:', error.message);
  }
}

// Run the debugging
async function main() {
  await debugHouseholdWeather();
  await testWeatherAPI();
  
  console.log('\n🔧 Debugging complete!');
  console.log('\n💡 Next steps:');
  console.log('1. If no coordinates: Set household address in profile');
  console.log('2. If coordinates exist but weather fails: Check API integration');
  console.log('3. If external API fails: Check network/firewall');
}

main().catch(console.error);