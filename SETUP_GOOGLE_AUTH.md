# Setting Up Google OAuth for Dayboard

## Prerequisites
You need to have completed these steps:
1. ✅ Run `setup_database.sql` in your Supabase SQL Editor (creates all tables)
2. ⚠️ Set up Google OAuth (follow steps below)

## Step 1: Create Google OAuth Application

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Set Application type to "Web application"
   - Add these Authorized redirect URIs:
     ```
     https://csbwewirwzeitavhvykr.supabase.co/auth/v1/callback
     http://localhost:3001/auth/callback
     ```
   - Copy the Client ID and Client Secret

## Step 2: Configure Google OAuth in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `csbwewirwzeitavhvykr`
3. Go to "Authentication" > "Providers"
4. Find "Google" and toggle it ON
5. Enter your Google OAuth credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click "Save"

## Step 3: Test the Authentication Flow

1. Make sure your dev server is running: `npm run dev`
2. Go to http://localhost:3001/signin
3. Click "Continue with Google"
4. Complete the OAuth flow
5. You should be redirected to the profile setup page

## What Happens After Setup

### First-Time Users:
1. User clicks "Continue with Google"
2. Google OAuth redirects to /profile
3. ProfileSetup component shows 3-step wizard:
   - Step 1: Personal info (name, age, profession)
   - Step 2: Household setup (household name)
   - Step 3: Address information
4. Creates profile, household, and household_member records
5. User is now fully set up

### Returning Users:
1. User clicks "Continue with Google"
2. Google OAuth redirects to /profile
3. Shows existing profile and household information
4. User can edit their profile or access other features

## Database Tables Created
After running `setup_database.sql`, you'll have:
- ✅ `profiles` - User profile information
- ✅ `households` - Household/family information
- ✅ `household_members` - Links users to households
- ✅ `credentials` - Password manager data

## Troubleshooting

### "Loading..." stuck on any page
- Make sure you've run `setup_database.sql` in Supabase
- Check browser console for database errors

### Google OAuth not working
- Verify redirect URIs are correct in Google Cloud Console
- Make sure Google+ API is enabled
- Check that Client ID/Secret are correctly entered in Supabase

### Profile setup not showing
- Check browser console for errors
- Verify database tables exist in Supabase

## Next Steps
Once authentication is working:
1. Test the credentials manager at /credentials
2. Explore other features (dashboard, meals, projects)
3. Invite family members to join your household
