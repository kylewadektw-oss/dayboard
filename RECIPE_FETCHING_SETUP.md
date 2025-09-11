# 🍽️ Recipe Fetching Setup Guide

Welcome to the new recipe fetching system! This guide will help you get started with fetching real recipes from the Spoonacular API.

## 🚀 Quick Start

### 1. Get Your Spoonacular API Key

1. Go to [Spoonacular API](https://spoonacular.com/food-api)
2. Click "Get API Key" or "Sign Up"
3. Create a free account
4. After signing up, go to your dashboard
5. Copy your API key

### 2. Add API Key to Environment

1. Open your `.env.local` file in the project root
2. Find the line: `SPOONACULAR_API_KEY=your_api_key_here`
3. Replace `your_api_key_here` with your actual API key
4. Save the file

Example:
```
SPOONACULAR_API_KEY=abc123def456ghi789
```

### 3. Test the Integration

1. Navigate to the Recipe Library in your app
2. Click "Fetch New Recipes" button
3. Or try one of the quick category buttons like "🍗 Chicken Recipes"

## 📚 Features Available

### Main Features
- **Fetch New Recipes**: Downloads popular recipes from Spoonacular
- **Category Fetching**: Get recipes by specific categories (chicken, vegetarian, etc.)
- **Search Integration**: Fetch recipes based on search terms
- **Duplicate Prevention**: Won't add the same recipe twice
- **Progress Tracking**: See how many recipes were fetched and added

### Quick Categories Available
- ⭐ Popular Recipes
- ⚡ Quick & Easy (under 30 minutes)
- 🥗 Healthy Meals
- 🍲 Comfort Food
- 🌱 Vegetarian
- 🍗 Chicken Recipes

## 🔧 API Details

### Rate Limits (Free Plan)
- 150 requests per day
- 1 request per second

### How It Works
1. **Fetch**: App calls Spoonacular API with search terms
2. **Transform**: Converts Spoonacular data to our recipe format
3. **Store**: Saves recipes to your Supabase database
4. **Display**: Shows recipes in your library

### Data Included
- Recipe title and description
- Cooking time and servings
- Ingredients list with measurements
- Step-by-step instructions
- Dietary information
- Nutrition facts
- Recipe image

## 🔍 Troubleshooting

### Common Issues

**"API key not found" error:**
- Make sure you added the API key to `.env.local`
- Restart your development server after adding the key
- Check that there are no extra spaces around the key

**"Rate limit exceeded" error:**
- You've hit the daily limit (150 requests)
- Wait until tomorrow or upgrade your Spoonacular plan

**"No recipes found" error:**
- Try a different search term
- Some very specific searches might not return results

**Recipes aren't showing up:**
- Check the browser console for errors
- Make sure your database migration has been deployed
- The fetch might have worked but display is using mock data

### Need Help?

1. Check the browser console for detailed error messages
2. Verify your API key is working by testing it directly on Spoonacular
3. Make sure your internet connection is stable

## 🎯 Next Steps

Once you have recipes loading:

1. **Deploy Database**: Make sure your recipe tables are deployed to production
2. **Test Categories**: Try different recipe categories
3. **Custom Searches**: Use the search bar to find specific types of recipes
4. **Build Collections**: Organize recipes by creating meal plans

## 📊 API Usage Tips

### Maximize Your Free Credits
- Use broader search terms to get more varied results
- Focus on categories that match your household's preferences
- Fetch recipes in batches rather than one at a time

### Popular Search Terms
- "chicken breast recipes"
- "30 minute meals"
- "vegetarian dinner"
- "healthy breakfast"
- "comfort food"
- "italian pasta"

## 🔒 Privacy & Data

- Recipe data is stored in your household's private database
- No personal data is sent to Spoonacular
- You control which recipes to keep or delete
- All data follows your existing household privacy settings

---

**Ready to start cooking? Get your API key and start fetching delicious recipes! 🍽️**
