#!/bin/bash

echo "🔍 Google OAuth Configuration Test"
echo "=================================="
echo

# Check if environment variables are set
echo "📋 Environment Variables Check:"
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set"
else
    echo "✅ NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
else
    echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..."
fi

echo
echo "🔧 Next Steps to Complete Google OAuth Setup:"
echo "1. Configure Google Cloud Console OAuth credentials"
echo "2. Add Google OAuth settings in Supabase Dashboard"
echo "3. Test authentication flow"
echo "4. Verify profile creation with Google metadata"
echo
echo "📖 Follow the guide: GOOGLE_OAUTH_SETUP.md"
echo "📊 Monitor logs: /logs-dashboard"
echo "🧪 Test authentication: /auth-test"
echo
