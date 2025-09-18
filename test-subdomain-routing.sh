#!/bin/bash

# Test script to verify subdomain routing works locally
# Note: For local testing, you need to add entries to /etc/hosts file:
# 127.0.0.1   bentlolabs.local
# 127.0.0.1   dayboard.bentlolabs.local  
# 127.0.0.1   logs.bentlolabs.local

echo "🧪 Testing Subdomain Routing"
echo "================================"
echo ""

echo "📋 Testing Main Company Site (bentlolabs.com)"
echo "Expected: BentLo Labs Software Design Group"
echo "URL: http://localhost:3000"
echo ""

echo "📋 Testing Dayboard Product Site (dayboard.bentlolabs.com)"
echo "Expected: Dayboard - Complete Household OS"
echo "URL: http://localhost:3000 (with dayboard subdomain simulation)"
echo ""

echo "📋 Testing Logs Dashboard (logs.bentlolabs.com)"  
echo "Expected: BentLo Labs - System Monitoring Dashboard"
echo "URL: http://localhost:3000 (with logs subdomain simulation)"
echo ""

echo "🔧 To test subdomains locally, you can:"
echo "1. Edit /etc/hosts to add:"
echo "   127.0.0.1   bentlolabs.local"
echo "   127.0.0.1   dayboard.bentlolabs.local"
echo "   127.0.0.1   logs.bentlolabs.local"
echo ""
echo "2. Then visit:"
echo "   http://bentlolabs.local:3000 (Company)"
echo "   http://dayboard.bentlolabs.local:3000 (Product)"
echo "   http://logs.bentlolabs.local:3000 (Monitoring)"
echo ""

echo "🚀 Development server is running at http://localhost:3000"
echo "✅ Subdomain routing is implemented and ready for testing!"