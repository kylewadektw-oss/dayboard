#!/usr/bin/env node

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Spoonacular API Key Diagnostic Tool
 * Run this script to test your Spoonacular API key
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Spoonacular API Key Diagnostic Tool\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create a .env.local file in your project root.\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const apiKey = process.env.SPOONACULAR_API_KEY;

console.log('📋 Environment Check:');
console.log(`   .env.local found: ✅`);
console.log(`   API key exists: ${apiKey ? '✅' : '❌'}`);
console.log(`   API key value: ${apiKey || 'NOT SET'}`);

// Check if it's still the placeholder
if (!apiKey) {
  console.log('\n❌ No API key found in environment variables.');
  console.log('Add this line to your .env.local file:');
  console.log('SPOONACULAR_API_KEY=your_actual_api_key_here\n');
  process.exit(1);
}

if (apiKey === 'your_spoonacular_api_key_here' || apiKey === 'your_api_key_here') {
  console.log('\n❌ API key is still set to placeholder value.');
  console.log('Please replace it with your actual Spoonacular API key.\n');
  console.log('Steps to get your API key:');
  console.log('1. Go to https://spoonacular.com/food-api');
  console.log('2. Sign up for a free account');
  console.log('3. Go to your dashboard and copy your API key');
  console.log('4. Replace the placeholder in .env.local\n');
  process.exit(1);
}

// Test the API key
console.log('\n🧪 Testing API connection...');

async function testApiKey() {
  try {
    const testUrl = `https://api.spoonacular.com/recipes/complexSearch?query=chicken&number=1&apiKey=${apiKey}`;
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API key is working!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Found ${data.totalResults || 0} recipes`);
      console.log(`   Remaining requests today: ${response.headers.get('x-api-quota-left') || 'Unknown'}`);
      console.log('\n🎉 Your Spoonacular integration is ready to use!');
    } else {
      console.log('❌ API request failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.message || 'Unknown error'}`);
      
      if (response.status === 401) {
        console.log('\n💡 This usually means:');
        console.log('   - Invalid API key');
        console.log('   - API key not activated');
        console.log('   - Check your Spoonacular dashboard');
      } else if (response.status === 402) {
        console.log('\n💡 This usually means:');
        console.log('   - Daily quota exceeded');
        console.log('   - Need to upgrade your plan');
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('\n💡 Check your internet connection and try again.');
  }
}

testApiKey();
