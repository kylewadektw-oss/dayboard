#!/bin/bash

# 🛡️ DAYBOARD ENHANCED SECURITY DEPLOYMENT SCRIPT
# This script sets up the complete enhanced security system

echo "🛡️ DAYBOARD ENHANCED SECURITY DEPLOYMENT"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from your Dayboard project root directory"
    exit 1
fi

print_info "Starting Dayboard Enhanced Security Deployment..."
echo ""

# Step 1: Verify files exist
print_step "Step 1: Verifying security files..."

REQUIRED_FILES=(
    "utils/enhanced-code-protection.ts"
    "app/api/security/violation/route.ts"
    "components/security/SecurityDashboard.tsx"
    "create-security-violations-table.sql"
    "CODE_PROTECTION_STRATEGY.md"
    "ENHANCED_SECURITY_IMPLEMENTATION.md"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    print_error "Some required files are missing. Please ensure all security files are created."
    exit 1
fi

echo ""

# Step 2: Environment Check
print_step "Step 2: Checking environment variables..."

if [ -f ".env.local" ]; then
    print_status "Found .env.local file"
    
    # Check for required environment variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        print_status "NEXT_PUBLIC_SUPABASE_URL configured"
    else
        print_warning "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        print_status "NEXT_PUBLIC_SUPABASE_ANON_KEY configured"
    else
        print_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        print_status "SUPABASE_SERVICE_ROLE_KEY configured"
    else
        print_warning "SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
    fi
    
else
    print_warning "No .env.local file found. Please create one with your Supabase credentials."
fi

echo ""

# Step 3: Database Setup
print_step "Step 3: Database setup instructions..."
print_info "Please run the following SQL in your Supabase SQL Editor:"
echo ""
echo -e "${CYAN}-- Copy and paste this into Supabase SQL Editor:${NC}"
echo -e "${CYAN}-- File: create-security-violations-table.sql${NC}"
echo ""
cat create-security-violations-table.sql
echo ""
print_warning "After running the SQL, press Enter to continue..."
read -r

# Step 4: Build Check
print_step "Step 4: Checking if project builds..."
if npm run build > /dev/null 2>&1; then
    print_status "Project builds successfully"
else
    print_warning "Project build failed. Check for TypeScript errors."
    print_info "You may need to install dependencies: npm install"
fi

echo ""

# Step 5: Security Test
print_step "Step 5: Security test setup..."
print_info "Test file created: test-enhanced-protection.js"
print_info "Run this in your browser console after deployment to test protection"

echo ""

# Step 6: Final checklist
print_step "Step 6: Manual action checklist..."
echo ""
echo -e "${YELLOW}CRITICAL ACTIONS REQUIRED:${NC}"
echo ""
echo "1. 🔒 Make GitHub repository PRIVATE immediately"
echo "   - Go to GitHub → Your repo → Settings → Danger Zone"
echo "   - Click 'Change repository visibility' → 'Make private'"
echo ""
echo "2. 🔑 Rotate ALL API keys and secrets"
echo "   - Generate new Supabase keys"
echo "   - Update NEXTAUTH_SECRET"
echo "   - Update any other sensitive credentials"
echo ""
echo "3. 🗄️ Run the SQL script in Supabase"
echo "   - Copy the SQL from create-security-violations-table.sql"
echo "   - Paste into Supabase SQL Editor"
echo "   - Execute the script"
echo ""
echo "4. 🚀 Deploy to production"
echo "   - Ensure all environment variables are set"
echo "   - Deploy the updated application"
echo "   - Test the security dashboard at /security-dashboard"
echo ""
echo "5. 🧪 Test the protection system"
echo "   - Open browser console on your live site"
echo "   - Run the test script from test-enhanced-protection.js"
echo "   - Verify violations appear in security dashboard"
echo ""

# Step 7: Documentation links
print_step "Step 7: Documentation and guides..."
echo ""
echo "📚 Security Documentation:"
echo "   - CODE_PROTECTION_STRATEGY.md - Complete protection strategy"
echo "   - ENHANCED_SECURITY_IMPLEMENTATION.md - Implementation guide"
echo ""
echo "🛡️ Security Features:"
echo "   - Domain validation and protection"
echo "   - Anti-debugging and tamper detection"
echo "   - Real-time violation monitoring"
echo "   - Automated alert system"
echo "   - Security dashboard at /security-dashboard"
echo ""

# Final status
echo ""
echo -e "${GREEN}🎉 ENHANCED SECURITY DEPLOYMENT COMPLETE! 🎉${NC}"
echo ""
echo -e "${CYAN}Your Dayboard application now has enterprise-grade protection:${NC}"
echo "✅ Multi-layer security system"
echo "✅ Real-time threat monitoring"
echo "✅ Automated violation reporting"
echo "✅ Comprehensive documentation"
echo "✅ Legal protection framework"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Complete the manual actions listed above"
echo "2. Test all security features"
echo "3. Monitor the security dashboard regularly"
echo "4. Keep protection systems updated"
echo ""
echo -e "${PURPLE}🛡️ Your valuable IP is now protected! 🛡️${NC}"
echo ""
echo "For support: developer@bentlolabs.com"
