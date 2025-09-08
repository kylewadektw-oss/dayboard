/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/**
 * 🔧 BUILD OPTIMIZATION TEST
 * 
 * Tests webpack configuration and buffer optimizations to resolve:
 * "[webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB) impacts 
 * deserialization performance (consider using Buffer instead and decode when needed)"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing Build Optimization...\n');

// Check Next.js configuration
console.log('📋 Checking Next.js Configuration:');
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('✅ next.config.js exists');
  const config = fs.readFileSync(nextConfigPath, 'utf8');
  if (config.includes('webpack:')) {
    console.log('✅ Webpack configuration found');
  } else {
    console.log('❌ Webpack configuration missing');
  }
  if (config.includes('splitChunks')) {
    console.log('✅ Code splitting optimization enabled');
  } else {
    console.log('❌ Code splitting optimization missing');
  }
} else {
  console.log('❌ next.config.js not found');
}

// Check for large files that might cause the warning
console.log('\n📁 Checking for Large Files:');
const checkLargeFiles = () => {
  try {
    const result = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v node_modules | grep -v .next | xargs wc -c | sort -nr | head -10', { encoding: 'utf8' });
    console.log('Largest files:');
    console.log(result);
  } catch (error) {
    console.log('Could not analyze file sizes');
  }
};

checkLargeFiles();

// Test buffer optimization utility
console.log('\n🚀 Testing Buffer Optimization:');
try {
  const { serializeToBuffer, deserializeFromBuffer, optimizedStringify } = require('./utils/buffer-optimization');
  
  // Test with a large object
  const testData = {
    large_array: new Array(1000).fill(0).map((_, i) => ({
      id: i,
      data: `This is test data item ${i} with some content`,
      timestamp: new Date().toISOString(),
    })),
    metadata: {
      version: '1.0.0',
      created: new Date().toISOString(),
    },
  };
  
  const buffer = serializeToBuffer(testData);
  const restored = deserializeFromBuffer(buffer);
  
  console.log(`✅ Buffer serialization test passed`);
  console.log(`   Original items: ${testData.large_array.length}`);
  console.log(`   Restored items: ${restored.large_array.length}`);
  console.log(`   Buffer size: ${(buffer.length / 1024).toFixed(1)}KB`);
  
} catch (error) {
  console.log('❌ Buffer optimization test failed:', error.message);
}

// Test build without output
console.log('\n🏗️  Testing Build Process:');
try {
  console.log('Building project (this may take a moment)...');
  execSync('npm run build > /tmp/build.log 2>&1');
  
  // Check if the warning appears in the build log
  const buildLog = fs.readFileSync('/tmp/build.log', 'utf8');
  
  if (buildLog.includes('Serializing big strings')) {
    console.log('⚠️  Large string serialization warning still present');
    // Extract relevant lines
    const lines = buildLog.split('\n');
    const warningLines = lines.filter(line => 
      line.includes('Serializing big strings') || 
      line.includes('PackFileCacheStrategy')
    );
    warningLines.forEach(line => console.log(`   ${line.trim()}`));
  } else {
    console.log('✅ No large string serialization warnings found');
  }
  
  if (buildLog.includes('Compiled successfully')) {
    console.log('✅ Build completed successfully');
  } else {
    console.log('❌ Build failed or had issues');
  }
  
} catch (error) {
  console.log('❌ Build test failed:', error.message);
}

console.log('\n✨ Build optimization test complete!');
