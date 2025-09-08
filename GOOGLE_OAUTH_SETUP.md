# Google OAuth Setup Guide

## Overview
This guide will walk you through setting up Google OAuth authentication for Dayboard, which will lock down the site to authenticated users only (except for the landing page).

## Current Implementation Status
✅ **COMPLETED**:
- Updated OauthSignIn component with Google OAuth integration
- Activated middleware authentication protection
- Landing page (/) remains public
- Auth callback handling ready
- User profile creation on first login

## Required: Supabase Configuration

### 1. Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** and click **Enable**

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set **Application type** to **Web application**
6. Add **Authorized redirect URIs**:
   ```
   https://[YOUR-SUPABASE-URL]/auth/v1/callback
   ```
   Replace `[YOUR-SUPABASE-URL]` with your actual Supabase project URL

### 3. Configure Supabase with Google Credentials

1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. In Supabase Dashboard, paste them into the Google provider settings
3. Set **Redirect URL** to: `https://[YOUR-DOMAIN]/auth/callback`
4. **Save** the configuration

### 4. Environment Variables (Optional)

Add to your `.env.local` file if needed:
```bash
# These are already configured in Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Flow

### Protected Routes
All routes except the following require authentication:
- `/` - Landing page (public)
- `/auth/callback` - OAuth callback
- `/auth/reset_password` - Password reset

### User Experience
1. **Unauthenticated users** visiting protected routes → Redirected to `/signin`
2. **Landing page visitors** → Can browse freely
3. **"Get Started" button** → Redirects to `/profile` (requires auth)
4. **Google OAuth** → Successful login redirects to `/dashboard`
5. **Profile creation** → Automatic on first login with Google data

### Security Features
- ✅ OAuth 2.0 with Google
- ✅ Automatic user profile creation
- ✅ Protected routes middleware
- ✅ Session management
- ✅ Secure token handling

## Testing Authentication

### 1. Test Public Access
- Visit `/` - Should load without authentication
- Landing page should be fully accessible

### 2. Test Protected Routes
- Visit `/dashboard` - Should redirect to `/signin`
- Visit `/meals` - Should redirect to `/signin`
- Visit `/profile` - Should redirect to `/signin`

### 3. Test Authentication Flow
1. Go to `/signin`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect to `/dashboard`
5. Profile should be created automatically

### 4. Test Sign Out
- Use sign out functionality
- Should redirect to landing page
- Protected routes should require re-authentication

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Ensure Google Cloud Console has correct redirect URI
- Format: `https://[supabase-url]/auth/v1/callback`

**"Authentication failed"**
- Check Supabase Google provider configuration
- Verify Client ID and Secret are correct
- Ensure Google+ API is enabled

**"Profile creation failed"**
- Check database permissions
- Verify profiles table exists and is accessible
- Check RLS policies

### Debug Mode
Check browser console and network tab for authentication errors.

## Next Steps

After completing this setup:

1. **Test thoroughly** with the steps above
2. **Configure RLS policies** for proper data security
3. **Set up user roles** if needed
4. **Test on production domain** when deployed
5. **Add additional OAuth providers** if desired

## Security Notes

- ✅ Landing page remains public for marketing
- ✅ All app functionality requires authentication
- ✅ Secure session management with Supabase
- ✅ User profiles auto-created with Google data
- ✅ Middleware-level protection

The authentication system is now active and will protect your application while keeping the landing page public for visitors.
