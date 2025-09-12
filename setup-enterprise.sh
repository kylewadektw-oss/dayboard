#!/bin/bash

# 🏢 Bentlolabs Enterprise Deployment Setup
# Phase 2: Complete enterprise architecture deployment

echo "🏢 Setting up Bentlolabs Enterprise Architecture..."
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from your Dayboard project directory"
    exit 1
fi

echo "📊 Phase 2: Enterprise Foundation"
echo "1. Monitor Service (monitor.bentlolabs.com)"
echo "2. Company Site (bentlolabs.com)"  
echo "3. Dayboard App (bentlolabs.com/dayboard)"
echo "4. Unified Monitoring Configuration"
echo

read -p "🚀 Ready to deploy enterprise architecture? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo
echo "📦 Building production assets..."
npm run build

echo
echo "🔧 Step 1: Deploy Monitoring Service"
echo "This will be your monitor.bentlolabs.com subdomain"
echo

echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo
echo "✅ Monitoring service deployed!"
echo
echo "🎯 Next Manual Steps:"
echo
echo "1. 🌐 Configure Custom Domain in Vercel:"
echo "   • Go to Vercel Dashboard → Your Project → Settings → Domains"
echo "   • Add domain: monitor.bentlolabs.com"
echo "   • Copy the DNS records provided"
echo
echo "2. 📡 Update Squarespace DNS:"
echo "   • Go to Squarespace → Settings → Domains → DNS Settings"
echo "   • Add CNAME record: monitor → [vercel-provided-value]"
echo
echo "3. ⏳ Wait for DNS propagation (5-30 minutes)"
echo
echo "4. 🔍 Verify monitoring service:"
echo "   • Visit: https://monitor.bentlolabs.com/logs-dashboard"
echo "   • Test: https://monitor.bentlolabs.com/logs-dashboard/devtools"
echo
echo "📋 After DNS is configured, run:"
echo "   ./setup-company-site.sh (next script)"
echo
echo "📖 See MONITORING_SERVICE.md for detailed configuration"
echo "✨ Phase 1 complete - monitoring foundation ready!"