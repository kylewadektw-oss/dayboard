#!/usr/bin/env node

/**
 * 🛡️ COPYRIGHT HEADER INJECTION SCRIPT
 * 
 * Adds copyright and proprietary notices to all source files
 * to protect against unauthorized copying and establish ownership
 */

const fs = require('fs');
const path = require('path');

const COPYRIGHT_HEADER = `/*
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

`;

const SCRIPT_HEADER = `#!/usr/bin/env node
${COPYRIGHT_HEADER}`;

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const SCRIPT_EXTENSIONS = ['.js'];

// Directories to process
const DIRECTORIES = ['app', 'components', 'utils', 'types', 'contexts', 'styles'];

function hasExistingCopyright(content) {
  // If has ANY old copyright headers (including duplicates or old email/terminology), force update
  if (content.includes('DAYBOARD PROPRIETARY CODE') || content.includes('Copyright (c) 2025 Kyle Wade')) {
    return false; // Always force update to clean up
  }
  
  return false; // Process all files to ensure consistency
}

function removeOldCopyrightHeader(content) {
  let lines = content.split('\n');
  let modified = true;
  
  // Keep removing headers until no more are found
  while (modified) {
    modified = false;
    let startIndex = -1;
    let endIndex = -1;
    
    // Find start of any copyright header
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('/*') && i + 1 < lines.length && 
          (lines[i + 1].includes('DAYBOARD PROPRIETARY CODE') || 
           lines[i + 1].includes('Copyright (c)') ||
           lines[i].includes('🛡️ DAYBOARD PROPRIETARY CODE'))) {
        startIndex = i;
        break;
      }
    }
    
    // Find end of copyright header
    if (startIndex >= 0) {
      for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].trim() === '*/') {
          endIndex = i;
          break;
        }
      }
    }
    
    // Remove old header if found
    if (startIndex >= 0 && endIndex >= 0) {
      lines.splice(startIndex, endIndex - startIndex + 1);
      modified = true;
      
      // Remove any trailing empty lines
      while (lines[startIndex] && lines[startIndex].trim() === '') {
        lines.splice(startIndex, 1);
      }
    }
  }
  
  return lines.join('\n');
}

function addCopyrightHeader(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if this file has any copyright headers (clean up all duplicates)
    const hasAnyHeaders = content.includes('DAYBOARD PROPRIETARY CODE') || content.includes('Copyright (c) 2025 Kyle Wade');
    
    // Skip if already has updated copyright (no cleanup needed)
    if (hasExistingCopyright(content)) {
      console.log(`⏭️  Skipping ${filePath} (already has copyright)`);
      return;
    }
    
    // Remove ALL old headers first
    if (hasAnyHeaders) {
      console.log(`🧹 Cleaning up ${filePath} (removing duplicate/old headers)`);
      content = removeOldCopyrightHeader(content);
    }
    
    const ext = path.extname(filePath);
    const isScript = SCRIPT_EXTENSIONS.includes(ext) && content.startsWith('#!');
    
    let newContent;
    if (isScript) {
      // For scripts, preserve shebang
      const lines = content.split('\n');
      const shebang = lines[0];
      const rest = lines.slice(1).join('\n');
      newContent = shebang + '\n' + COPYRIGHT_HEADER + rest;
    } else {
      // For regular files
      newContent = COPYRIGHT_HEADER + content;
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ ${hasAnyHeaders ? 'Cleaned up and updated' : 'Added'} copyright to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and .next
        if (!item.name.startsWith('.') && item.name !== 'node_modules') {
          processDirectory(fullPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (EXTENSIONS.includes(ext)) {
          addCopyrightHeader(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message);
  }
}

function main() {
  console.log('🛡️ Adding copyright headers to protect your code...\n');
  
  // Process main directories
  for (const dir of DIRECTORIES) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Processing ${dir}/`);
      processDirectory(dir);
    }
  }
  
  // Process root TypeScript files
  const rootFiles = fs.readdirSync('.').filter(file => {
    const ext = path.extname(file);
    return EXTENSIONS.includes(ext);
  });
  
  for (const file of rootFiles) {
    addCopyrightHeader(file);
  }
  
  console.log('\n✅ Copyright protection headers added successfully!');
  console.log('🛡️ Your code is now better protected against unauthorized copying.');
}

main();
