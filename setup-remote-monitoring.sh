#!/bin/bash

# 🚀 Quick Remote Monitoring Setup for bentlolabs.com
# This script helps you deploy Dayboard and set up remote monitoring

echo "🌐 Setting up remote monitoring for bentlolabs.com..."
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from your Dayboard project directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "🚀 Ready to deploy! Choose your deployment method:"
echo
echo "1) Vercel (Recommended - Free tier available)"
echo "2) Railway (Alternative platform)"
echo "3) Custom deployment"
echo

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔶 Deploying to Vercel..."
        
        echo "🚀 Starting Vercel deployment..."
        npx vercel --prod
        
        echo
        echo "✅ Deployment complete!"
        echo "📋 Next steps:"
        echo "1. Copy your Vercel URL from above"
        echo "2. Update DAYBOARD_API in public/remote-monitor.js"
        echo "3. Add the script to bentlolabs.com:"
        echo "   <script async src=\"YOUR_VERCEL_URL/remote-monitor.js\"></script>"
        ;;
    2)
        echo "🚂 Deploying to Railway..."
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "🚀 Starting Railway deployment..."
        railway login
        railway init
        railway up
        
        echo
        echo "✅ Deployment complete!"
        echo "📋 Next steps:"
        echo "1. Copy your Railway URL from above"
        echo "2. Update DAYBOARD_API in public/remote-monitor.js"
        echo "3. Add the script to bentlolabs.com:"
        echo "   <script async src=\"YOUR_RAILWAY_URL/remote-monitor.js\"></script>"
        ;;
    3)
        echo "🛠️  Custom deployment selected"
        echo "📋 Manual steps:"
        echo "1. Deploy your built project to your hosting platform"
        echo "2. Update DAYBOARD_API in public/remote-monitor.js with your URL"
        echo "3. Add the script to bentlolabs.com:"
        echo "   <script async src=\"YOUR_DEPLOYED_URL/remote-monitor.js\"></script>"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo
echo "🎯 After deployment:"
echo "• Visit your logs dashboard at YOUR_URL/logs-dashboard"
echo "• Filter by Component: 'RemoteMonitor' to see bentlolabs.com data"
echo "• Check the DevTools monitor at YOUR_URL/logs-dashboard/devtools"
echo
echo "📖 For detailed instructions, see REMOTE_MONITORING_SETUP.md"
echo "✨ Happy monitoring!"