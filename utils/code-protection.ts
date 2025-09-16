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

/*
 * 🛠️ CODE-PROTECTION UTILITY - Helper Functions
 *
 * PURPOSE: Utility functions and helpers for code-protection functionality
 *
 * EXPORTS:
 * - [List main functions and classes]
 * - [Constants and type definitions]
 * - [Helper utilities and tools]
 *
 * USAGE:
 * ```typescript
 * import { functionName } from '@/utils/code-protection';
 *
 * const result = functionName(parameters);
 * ```
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
 */

/**
 * 🔒 CODE PROTECTION UTILITIES
 *
 * Provides runtime protection against code theft and unauthorized inspection
 */

// Anti-debugging protection
export function initCodeProtection() {
  if (typeof window === 'undefined') return; // Server-side skip

  // Detect developer tools
  let devtools = { open: false, orientation: null };

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > 200 ||
      window.outerWidth - window.innerWidth > 200
    ) {
      if (!devtools.open) {
        devtools.open = true;
        console.clear();
        console.log(
          '%c🛡️ DAYBOARD PROPRIETARY CODE',
          'color: red; font-size: 20px; font-weight: bold;'
        );
        console.log(
          '%cUnauthorized code inspection is prohibited!',
          'color: red; font-size: 16px;'
        );
        console.log(
          '%cLarge corporations copying this code may face legal action.',
          'color: orange; font-size: 14px;'
        );
        console.log(
          '%cContact licensing@dayboard.com for commercial use.',
          'color: blue; font-size: 14px;'
        );

        // Optional: Redirect away from sensitive pages
        if (
          window.location.pathname.includes('/logs') ||
          window.location.pathname.includes('/admin')
        ) {
          window.location.href = '/';
        }
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Disable right-click context menu on production
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      console.log('🛡️ Right-click disabled to protect proprietary code');
    });

    // Disable common keyboard shortcuts for developer tools
    document.addEventListener('keydown', (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        console.log('🛡️ Developer tools access disabled');
        return false;
      }
    });
  }
}

// Domain protection - ensure app only runs on authorized domains
export function validateDomain() {
  if (typeof window === 'undefined') return true; // Server-side skip

  // Always allow development environments
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const authorizedDomains = [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    'bentlolabs.com',
    'www.bentlolabs.com'
  ];

  // Additional patterns for development/preview domains
  const developmentPatterns = ['.vercel.app', '.netlify.app', '.railway.app'];

  const currentDomain = window.location.hostname;

  // Always allow localhost and development environments
  if (
    currentDomain.includes('localhost') ||
    currentDomain.includes('127.0.0.1') ||
    process.env.NODE_ENV !== 'production'
  ) {
    return true;
  }

  // Check authorized domains
  const isAuthorized = authorizedDomains.some(
    (domain) => currentDomain === domain || currentDomain.endsWith('.' + domain)
  );

  // Check development patterns
  const isDevelopment = developmentPatterns.some((pattern) =>
    currentDomain.endsWith(pattern)
  );

  if (
    !isAuthorized &&
    !isDevelopment &&
    process.env.NODE_ENV === 'production'
  ) {
    console.error('🛡️ Unauthorized domain detected!');
    console.error(
      'This application is proprietary and cannot run on unauthorized domains.'
    );

    // Redirect to official site or show error
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px; font-family: Arial;">
        <h1 style="color: red;">🛡️ Unauthorized Access</h1>
        <p>This is proprietary software that cannot run on unauthorized domains.</p>
        <p>For licensing inquiries, contact: licensing@dayboard.com</p>
      </div>
    `;
    return false;
  }

  return true;
}

// Watermark injection to identify the source
export function addOwnershipWatermark() {
  if (typeof window === 'undefined') return;

  // Add invisible watermark to the page
  const watermark = document.createElement('div');
  watermark.style.position = 'fixed';
  watermark.style.bottom = '0';
  watermark.style.right = '0';
  watermark.style.opacity = '0.01';
  watermark.style.fontSize = '1px';
  watermark.style.pointerEvents = 'none';
  watermark.style.zIndex = '-1';
  watermark.textContent = 'Dayboard © 2025 Kyle Wade - Proprietary Software';

  document.body.appendChild(watermark);

  // Add to console
  console.log(
    '%c🛡️ Dayboard © 2025 Kyle Wade',
    'color: #666; font-size: 12px;'
  );
  console.log(
    '%cThis is proprietary software. Unauthorized copying prohibited.',
    'color: #666; font-size: 10px;'
  );
}

// License key validation (for future commercial use)
export function validateLicenseKey(key?: string) {
  // This is a placeholder for future license key validation
  // You can implement server-side license checking here
  return true;
}

// Initialize all protections
export function initAllProtections() {
  if (typeof window !== 'undefined') {
    // Only run in browser
    if (validateDomain()) {
      initCodeProtection();
      addOwnershipWatermark();
    }
  }
}
