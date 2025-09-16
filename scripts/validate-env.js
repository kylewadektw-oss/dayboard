#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Checks if all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env files
function loadEnvFile(filename) {
  try {
    const envPath = path.join(process.cwd(), filename);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      return true;
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${filename}: ${error.message}`);
  }
  return false;
}

// Load environment files in order of precedence
loadEnvFile('.env.local');
loadEnvFile('.env');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Required environment variables
const requiredVars = {
  // Public variables (safe to log)
  public: [
    'NEXT_PUBLIC_APP_NAME',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
  ],
  // Secret variables (only check existence, don't log values)
  secrets: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_SECRET'
  ]
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function validateEnvironment() {
  log('\n🔍 Environment Variables Validation\n', 'bold');

  let hasErrors = false;

  // Check public variables
  log('📋 Public Variables:', 'blue');
  requiredVars.public.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: ${value}`, 'green');
    } else {
      log(`  ❌ ${varName}: Missing`, 'red');
      hasErrors = true;
    }
  });

  log('\n🔐 Secret Variables:', 'blue');
  requiredVars.secrets.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: Set (${value.length} characters)`, 'green');
    } else {
      log(`  ❌ ${varName}: Missing`, 'red');
      hasErrors = true;
    }
  });

  // Check file security
  log('\n📁 File Security Check:', 'blue');

  const envFiles = ['.env', '.env.local', '.env.production', '.env.staging'];
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');

  envFiles.forEach((filename) => {
    if (fs.existsSync(filename)) {
      if (gitignoreContent.includes(filename)) {
        log(`  ✅ ${filename}: Exists and ignored by git`, 'green');
      } else {
        log(`  ⚠️  ${filename}: Exists but NOT in .gitignore!`, 'yellow');
        hasErrors = true;
      }
    }
  });

  // Environment-specific checks
  log('\n🌍 Environment-Specific Checks:', 'blue');

  const nodeEnv = process.env.NODE_ENV || 'development';
  log(`  📍 NODE_ENV: ${nodeEnv}`);

  const isLocal = process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');
  const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const mockData = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';

  if (isLocal) {
    log('  🏠 Local development detected');
    if (!debugMode) {
      log('  ⚠️  Consider enabling debug mode for local development', 'yellow');
    }
  } else {
    log('  🌐 Production/staging environment detected');
    if (debugMode) {
      log('  ⚠️  Debug mode is enabled in production!', 'yellow');
    }
    if (mockData) {
      log('  ⚠️  Mock data is enabled in production!', 'yellow');
    }
  }

  // Final result
  log('\n' + '='.repeat(50), 'blue');
  if (hasErrors) {
    log(
      '❌ Environment validation failed! Please fix the issues above.',
      'red'
    );
    process.exit(1);
  } else {
    log(
      '✅ Environment validation passed! All variables are properly configured.',
      'green'
    );
  }
}

// Run validation
try {
  validateEnvironment();
} catch (error) {
  log(`\n❌ Error during validation: ${error.message}`, 'red');
  process.exit(1);
}
