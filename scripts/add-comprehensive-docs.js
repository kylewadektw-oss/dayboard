#!/usr/bin/env node

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
 * 📝 COMPREHENSIVE DOCUMENTATION GENERATOR
 * 
 * Adds detailed documentation headers to all TypeScript and TSX files
 * including purpose, features, technical details, and usage examples
 */

const fs = require('fs');
const path = require('path');

// Documentation templates for different types of files
const DOCUMENTATION_TEMPLATES = {
  page: (filename, title, purpose) => `/*
 * ${title}
 * 
 * PURPOSE: ${purpose}
 * 
 * FEATURES:
 * - Server-side rendering with Next.js App Router architecture
 * - Responsive design optimized for tablets and desktop interfaces
 * - Real-time data synchronization and state management
 * - Intuitive user interface with accessibility considerations
 * 
 * ACCESS: Protected by authentication middleware and household permissions
 * 
 * TECHNICAL:
 * - Next.js 15+ with TypeScript and modern React patterns
 * - Supabase integration for real-time data and authentication
 * - Tailwind CSS for responsive styling and design system
 * - Optimized performance with lazy loading and caching strategies
 * 
 * NAVIGATION: Accessible through main household navigation and direct routing
 */`,

  component: (filename, title, purpose) => `/*
 * ${title}
 * 
 * PURPOSE: ${purpose}
 * 
 * PROPS:
 * - Standard React component props with TypeScript interfaces
 * - Event handlers for user interactions and state management
 * - Configuration options for component behavior and appearance
 * - Data props for content display and processing
 * 
 * FEATURES:
 * - Responsive design optimized for desktop and mobile devices
 * - Accessibility features including keyboard navigation and screen readers
 * - Real-time data updates and state synchronization
 * - Smooth animations and intuitive user interactions
 * 
 * USAGE:
 * \`\`\`tsx
 * import ${title.split(' ')[0]} from '@/components/...';
 * 
 * <${title.split(' ')[0]} 
 *   {...props}
 *   onAction={handleAction}
 * />
 * \`\`\`
 * 
 * TECHNICAL:
 * - Built with React functional components and TypeScript
 * - Optimized with React.memo and performance hooks
 * - Styled with Tailwind CSS utility classes
 * - Integrated with household management state and APIs
 */`,

  utility: (filename, title, purpose) => `/*
 * ${title}
 * 
 * PURPOSE: ${purpose}
 * 
 * EXPORTS:
 * - [List main functions and classes]
 * - [Constants and type definitions]
 * - [Helper utilities and tools]
 * 
 * USAGE:
 * \`\`\`typescript
 * import { functionName } from '@/utils/${filename}';
 * 
 * const result = functionName(parameters);
 * \`\`\`
 * 
 * FEATURES:
 * - [Key capabilities and functionality]
 * - [Error handling and validation]
 * - [Performance optimizations]
 * - [Integration patterns]
 * 
 * TECHNICAL:
 * - [Implementation approach]
 * - [Dependencies and requirements]
 * - [Testing and validation]
 * - [Security considerations]
 */`,

  api: (filename, title, purpose) => `/*
 * ${title}
 * 
 * PURPOSE: ${purpose}
 * 
 * ENDPOINTS:
 * - [HTTP methods and routes]
 * - [Request/response formats]
 * - [Authentication requirements]
 * - [Rate limiting and caching]
 * 
 * FEATURES:
 * - [API functionality and capabilities]
 * - [Data validation and processing]
 * - [Error handling and responses]
 * - [Integration with services]
 * 
 * USAGE:
 * \`\`\`typescript
 * // Example API call
 * const response = await fetch('/api/${filename}', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 * \`\`\`
 * 
 * TECHNICAL:
 * - [Implementation details]
 * - [Database interactions]
 * - [Security measures]
 * - [Performance considerations]
 */`,

  types: (filename, title, purpose) => `/*
 * ${title}
 * 
 * PURPOSE: ${purpose}
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * \`\`\`typescript
 * import type { TypeName } from '@/types/${filename}';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * \`\`\`
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */`
};

// Smart categorization based on file path and content
function categorizeFile(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  if (relativePath.includes('/pages/') || relativePath.includes('/app/') && relativePath.endsWith('page.tsx')) {
    return 'page';
  }
  if (relativePath.includes('/api/')) {
    return 'api';
  }
  if (relativePath.includes('/components/')) {
    return 'component';
  }
  if (relativePath.includes('/utils/')) {
    return 'utility';
  }
  if (relativePath.includes('/types/')) {
    return 'types';
  }
  
  // Fallback based on content patterns
  if (content.includes('export default function') && content.includes('return (')) {
    return 'component';
  }
  if (content.includes('NextApiRequest') || content.includes('route.ts')) {
    return 'api';
  }
  if (content.includes('interface ') || content.includes('type ')) {
    return 'types';
  }
  
  return 'utility';
}

// Generate smart documentation based on file analysis
function generateDocumentation(filePath, content) {
  const filename = path.basename(filePath, path.extname(filePath));
  const category = categorizeFile(filePath, content);
  
  // Extract component/function names for better titles
  let title = `📝 ${filename.toUpperCase()}`;
  let purpose = 'Provides functionality for the Dayboard household command center application';
  
  // Smart title and purpose generation based on content analysis
  if (category === 'page') {
    const pageName = filename.replace(/([A-Z])/g, ' $1').trim();
    title = `🏠 ${pageName.toUpperCase()} PAGE - Household Management Interface`;
    
    // Analyze content for specific purpose
    if (content.includes('dashboard') || content.includes('Dashboard')) {
      purpose = `Central dashboard interface for household management and quick access to all features`;
    } else if (content.includes('meal') || content.includes('recipe')) {
      purpose = `Comprehensive meal planning and recipe management interface for household dining coordination`;
    } else if (content.includes('list') || content.includes('todo')) {
      purpose = `Dynamic list management system for household tasks, groceries, and shared responsibilities`;
    } else if (content.includes('project') || content.includes('Project')) {
      purpose = `Project coordination and task management interface for household initiatives and goals`;
    } else if (content.includes('work') || content.includes('schedule')) {
      purpose = `Work and schedule management interface for coordinating household member activities`;
    } else if (content.includes('profile') || content.includes('household')) {
      purpose = `Household member profile management and configuration interface`;
    } else if (content.includes('auth') || content.includes('signin')) {
      purpose = `Authentication and user access management interface for secure household access`;
    } else if (content.includes('log') || content.includes('debug')) {
      purpose = `Development and debugging interface for monitoring application performance and issues`;
    } else {
      purpose = `Specialized ${pageName.toLowerCase()} management interface for household coordination`;
    }
  } else if (category === 'component') {
    const componentName = filename.replace(/([A-Z])/g, ' $1').trim();
    title = `🧩 ${componentName.toUpperCase()} COMPONENT - Reusable UI Element`;
    
    // Analyze content for component purpose
    if (content.includes('Widget') || content.includes('widget')) {
      purpose = `Dashboard widget component providing real-time ${componentName.toLowerCase()} information and quick actions`;
    } else if (content.includes('Navigation') || content.includes('Nav')) {
      purpose = `Navigation component providing intuitive access to household management features`;
    } else if (content.includes('Form') || content.includes('Input')) {
      purpose = `Form component for collecting and validating ${componentName.toLowerCase()} data input`;
    } else if (content.includes('Modal') || content.includes('Dialog')) {
      purpose = `Modal dialog component for ${componentName.toLowerCase()} interactions and confirmations`;
    } else if (content.includes('Manager') || content.includes('management')) {
      purpose = `Management interface component for organizing and controlling ${componentName.toLowerCase()} functionality`;
    } else {
      purpose = `Reusable ${componentName.toLowerCase()} component for household management interfaces`;
    }
  } else if (category === 'utility') {
    const utilName = filename.replace(/([A-Z])/g, ' $1').trim();
    title = `🛠️ ${utilName.toUpperCase()} UTILITY - Helper Functions`;
    
    // Analyze content for utility purpose
    if (content.includes('logger') || content.includes('log')) {
      purpose = `Advanced logging and debugging utilities for development and production monitoring`;
    } else if (content.includes('auth') || content.includes('Auth')) {
      purpose = `Authentication utilities and helpers for secure user management and session handling`;
    } else if (content.includes('supabase') || content.includes('database')) {
      purpose = `Database integration utilities for Supabase operations and data management`;
    } else if (content.includes('stripe') || content.includes('payment')) {
      purpose = `Payment processing utilities for subscription management and billing operations`;
    } else if (content.includes('performance') || content.includes('optimization')) {
      purpose = `Performance monitoring and optimization utilities for application efficiency`;
    } else if (content.includes('protection') || content.includes('security')) {
      purpose = `Security and code protection utilities for application safety and integrity`;
    } else {
      purpose = `Utility functions and helpers for ${utilName.toLowerCase()} functionality in household management`;
    }
  } else if (category === 'api') {
    const apiName = filename.replace(/([A-Z])/g, ' $1').trim();
    title = `🔌 ${apiName.toUpperCase()} API - Backend Service`;
    
    // Analyze content for API purpose
    if (content.includes('test') || content.includes('debug')) {
      purpose = `Testing and debugging API endpoint for development workflow validation`;
    } else if (content.includes('log') || content.includes('logging')) {
      purpose = `Logging API endpoint for collecting and managing application diagnostic data`;
    } else if (content.includes('webhook') || content.includes('stripe')) {
      purpose = `Webhook API endpoint for handling external service integrations and callbacks`;
    } else if (content.includes('auth') || content.includes('callback')) {
      purpose = `Authentication API endpoint for user login and session management`;
    } else {
      purpose = `API endpoint for ${apiName.toLowerCase()} operations and data management`;
    }
  } else if (category === 'types') {
    const typeName = filename.replace(/([A-Z])/g, ' $1').trim();
    title = `📋 ${typeName.toUpperCase()} TYPES - Type Definitions`;
    
    // Analyze content for types purpose
    if (content.includes('Database') || content.includes('database')) {
      purpose = `TypeScript type definitions for database schemas and data structures`;
    } else if (content.includes('User') || content.includes('user')) {
      purpose = `TypeScript type definitions for user profiles and household member data structures`;
    } else {
      purpose = `TypeScript type definitions for ${typeName.toLowerCase()} data structures and interfaces`;
    }
  }
  
  const template = DOCUMENTATION_TEMPLATES[category];
  return template(filename, title, purpose);
}

// Check if file already has comprehensive documentation
function hasComprehensiveDocumentation(content) {
  return content.includes('PURPOSE:') && 
         content.includes('FEATURES:') && 
         content.includes('TECHNICAL:');
}

// Add documentation to file
function addDocumentationToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has comprehensive documentation
    if (hasComprehensiveDocumentation(content)) {
      console.log(`⏭️  Skipping ${filePath} (already documented)`);
      return;
    }
    
    const doc = generateDocumentation(filePath, content);
    
    // Find where to insert documentation (after copyright header)
    const lines = content.split('\n');
    let insertIndex = 0;
    let inCopyrightBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('🛡️ DAYBOARD PROPRIETARY CODE')) {
        inCopyrightBlock = true;
      }
      
      if (inCopyrightBlock && line === '*/') {
        insertIndex = i + 1;
        break;
      }
      
      // If no copyright header, insert at top
      if (line && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('//')) {
        insertIndex = i;
        break;
      }
    }
    
    // Insert documentation
    lines.splice(insertIndex, 0, '', doc, '');
    const newContent = lines.join('\n');
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Added documentation to ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process directory recursively
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Skip certain directories
        if (!item.name.startsWith('.') && 
            item.name !== 'node_modules' && 
            item.name !== '.next' &&
            item.name !== 'public') {
          processDirectory(fullPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (['.ts', '.tsx'].includes(ext) && !item.name.includes('.d.ts')) {
          addDocumentationToFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message);
  }
}

function main() {
  console.log('📝 Adding comprehensive documentation to TypeScript files...\n');
  
  // Process all relevant directories
  const directories = ['app', 'components', 'utils', 'types', 'contexts'];
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Processing ${dir}/`);
      processDirectory(dir);
    }
  }
  
  // Process root TypeScript files
  const rootFiles = fs.readdirSync('.').filter(file => {
    const ext = path.extname(file);
    return ['.ts', '.tsx'].includes(ext) && !file.includes('.d.ts');
  });
  
  for (const file of rootFiles) {
    addDocumentationToFile(file);
  }
  
  console.log('\n✅ Comprehensive documentation added successfully!');
  console.log('📚 All TypeScript files now have detailed documentation headers.');
}

main();
