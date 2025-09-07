#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix duplicate copyright headers in files
 */

const CLEAN_HEADER = `/*
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
 */`;

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find all copyright header starts
    const headerStarts = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('🛡️ DAYBOARD PROPRIETARY CODE')) {
        headerStarts.push(i - 1); // Include the /* line
      }
    }
    
    // If we have multiple headers, fix it
    if (headerStarts.length > 1) {
      console.log(`Fixing ${headerStarts.length} duplicate headers in: ${filePath}`);
      
      // Find where the first header ends
      let firstHeaderEnd = -1;
      for (let i = headerStarts[0]; i < lines.length; i++) {
        if (lines[i].trim() === '*/') {
          firstHeaderEnd = i;
          break;
        }
      }
      
      // Find where the last header ends
      let lastHeaderEnd = -1;
      for (let i = headerStarts[headerStarts.length - 1]; i < lines.length; i++) {
        if (lines[i].trim() === '*/') {
          lastHeaderEnd = i;
          break;
        }
      }
      
      if (firstHeaderEnd !== -1 && lastHeaderEnd !== -1) {
        // Remove all duplicate headers and replace with clean one
        const beforeHeaders = lines.slice(0, headerStarts[0]);
        const afterHeaders = lines.slice(lastHeaderEnd + 1);
        
        const newContent = [
          ...beforeHeaders,
          ...CLEAN_HEADER.split('\n'),
          '',
          ...afterHeaders
        ].join('\n');
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  let fixedCount = 0;
  
  function processFile(filePath) {
    const ext = path.extname(filePath);
    if (extensions.includes(ext)) {
      if (fixFile(filePath)) {
        fixedCount++;
      }
    }
  }
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git
        if (!['node_modules', '.git', '.next'].includes(item)) {
          walkDir(fullPath);
        }
      } else {
        processFile(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return fixedCount;
}

// Run the fix
console.log('🔧 Fixing duplicate copyright headers...');
const projectRoot = process.cwd();
const fixed = processDirectory(projectRoot);
console.log(`✅ Fixed duplicate headers in ${fixed} files`);
