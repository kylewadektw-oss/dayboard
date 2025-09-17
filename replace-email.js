#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to replace all instances of "developer@bentlolabs.com" with "developer@bentlolabs.com"
 * Copyright (c) 2025 BentLo Labs LLC
 */

console.log('🔄 Starting replacement of "developer@bentlolabs.com" with "developer@bentlolabs.com"...');

// Function to recursively find all files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.txt', '.sql', '.json', '.css']) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, .next, etc.
      if (!['node_modules', '.git', '.next', 'build', 'dist'].includes(item)) {
        files = files.concat(findFiles(fullPath, extensions));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext) || extensions.includes(item)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Function to replace text in a file
function replaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all instances of the email
    let newContent = content.replace(/kyle\.wade\.ktw@gmail\.com/g, 'developer@bentlolabs.com');
    
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const projectRoot = process.cwd();
console.log(`📁 Scanning directory: ${projectRoot}`);

const allFiles = findFiles(projectRoot);
console.log(`📄 Found ${allFiles.length} files to check`);

let updatedCount = 0;

for (const file of allFiles) {
  if (replaceInFile(file)) {
    updatedCount++;
  }
}

console.log(`\n🎉 Email replacement complete!`);
console.log(`📊 Updated ${updatedCount} files`);
console.log(`📋 Total files checked: ${allFiles.length}`);

// Verify the changes
console.log('\n🔍 Verifying changes...');
try {
  const result = execSync('grep -r "developer@bentlolabs.com" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.log('⚠️  Some instances may remain:');
    console.log(result);
  } else {
    console.log('✅ All instances of "developer@bentlolabs.com" have been replaced!');
  }
} catch (error) {
  console.log('ℹ️  Verification completed (no instances found)');
}