# Weather Setup Instructions

## 🌤️ Get Real Weather Data (Recommended)

### Step 1: Get OpenWeatherMap API Key
1. Go to https://openweathermap.org/api
2. Create a free account
3. Navigate to API Keys section
4. Copy your API key

### Step 2: Add to Environment
Add this line to your `.env.local` file:
```bash
NEXT_PUBLIC_OWM_API_KEY="your_actual_api_key_here"
```

### Step 3: Restart Development Server
```bash
npm run dev
```

## 🧪 Testing Weather

### 1. Check API Directly
```bash
# Test with your coordinates
curl "http://localhost:3000/api/weather?lat=40.7128&lon=-74.0060"
```

### 2. Check Dashboard
- Navigate to http://localhost:3000/dashboard
- Weather widget should appear in top-left

### 3. Check Sidebar
- Navigate to any authenticated page
- Weather should appear at top of left sidebar (when expanded)

## 🔧 Troubleshooting

### Weather Not Showing?
1. **Check Browser Console** for errors
2. **Verify Authentication** - must be logged in
3. **Check Household Address** in profile settings
4. **Verify API Key** using diagnostic tool:
   ```bash
   node weather-diagnostic.js
   ```

### Common Issues:
- ❌ Household coordinates not set
- ❌ User not authenticated  
- ❌ API key missing or invalid
- ❌ Network/CORS issues

### Expected Behavior:
- ✅ **With API Key**: Real weather for your location
- ✅ **Without API Key**: Mock data (72°F, clear sky)
- ✅ **No Location Set**: Link to set household address

## 📍 Setting Household Location

1. Go to Profile page
2. Update household address
3. Save changes
4. Weather will automatically use the coordinates

## 🆘 Need Help?

Run the diagnostic tool:
```bash
node weather-diagnostic.js
```

Check the logs in browser console for detailed error messages.