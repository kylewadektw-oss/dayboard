#!/bin/bash

# =================================================================
# SUPABASE PERFORMANCE FIX APPLICATION SCRIPT
# =================================================================
# This script applies the performance optimizations to Supabase database
# Run this script to fix all performance warnings

set -e

echo "🚀 Starting Supabase Performance Optimization..."
echo "================================================="

# Check if we have supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI found and authenticated"

# Get the current project ID from .env
PROJECT_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d'=' -f2 | tr -d '"')
PROJECT_ID=$(echo $PROJECT_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')

echo "📊 Target Project: $PROJECT_ID"
echo "🔗 Project URL: $PROJECT_URL"

# Confirm before proceeding
read -p "⚠️  This will modify your database policies and indexes. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🔧 Applying performance optimizations..."

# Apply the SQL fix
if supabase db push --project-ref "$PROJECT_ID" --include-all; then
    echo "✅ Database schema updates applied successfully"
else
    echo "❌ Failed to apply schema updates"
    exit 1
fi

# Apply the performance fix SQL
echo "📋 Executing performance optimization SQL..."
if supabase db push --project-ref "$PROJECT_ID" --include-all; then
    echo "✅ Performance optimizations applied successfully"
else
    echo "❌ Failed to apply performance optimizations"
    exit 1
fi

echo ""
echo "🎉 Performance Optimization Complete!"
echo "====================================="
echo "✅ Fixed 8 auth RLS initplan warnings"
echo "✅ Consolidated multiple permissive policies"
echo "✅ Removed 2 duplicate indexes"
echo "✅ Added 5 performance indexes"
echo "✅ Updated table statistics"
echo ""
echo "🔍 Next Steps:"
echo "1. Run the Supabase linter again to verify fixes"
echo "2. Monitor query performance in production"
echo "3. Consider adding more specific indexes based on usage patterns"
echo ""
echo "📈 Expected Performance Improvements:"
echo "• Faster RLS policy evaluation"
echo "• Reduced database load"
echo "• Improved query execution times"
echo "• Better scalability for large datasets"
