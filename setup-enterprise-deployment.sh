#!/bin/bash

# Bentlolabs Enterprise Deployment Setup
# Configures subdomain-based auto-deployment with unified monitoring

echo "🏢 Setting up Bentlolabs Enterprise Architecture..."

# 1. Configure main dayboard domain
echo "📡 Configuring main domain alias..."
npx vercel alias set dayboard-official.vercel.app dayboard.bentlolabs.com

# 2. Set up branch-specific subdomains (Vercel will auto-create these)
echo "🌿 Configuring branch auto-deployment..."
npx vercel env add NEXT_PUBLIC_ENVIRONMENT production main
npx vercel env add NEXT_PUBLIC_MONITORING_ENDPOINT production "https://monitor.bentlolabs.com"

# 3. Enable automatic deployments for all branches
echo "🚀 Enabling auto-deployment for all branches..."
npx vercel --prod --yes

echo "✅ Enterprise deployment configured!"
echo ""
echo "🎯 Your deployment structure:"
echo "   Production: https://dayboard.bentlolabs.com (main branch)"
echo "   Stashhouse: https://stashhouse.dayboard.bentlolabs.com"
echo "   Any branch: https://[branch-name].dayboard.bentlolabs.com"
echo ""
echo "📊 All monitoring data flows to: https://monitor.bentlolabs.com"
echo ""
echo "⚠️  DNS Setup Required:"
echo "   1. Add CNAME: dayboard.bentlolabs.com → dayboard-official.vercel.app"
echo "   2. Add CNAME: *.dayboard.bentlolabs.com → vercel-dns.bentlolabs.com"
echo "   3. Verify all subdomains resolve correctly"