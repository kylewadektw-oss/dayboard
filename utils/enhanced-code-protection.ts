/*
 * 🛡️ ENHANCED DAYBOARD CODE PROTECTION SYSTEM
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * MULTI-LAYER PROTECTION SYSTEM:
 * - Domain validation with fingerprinting
 * - Anti-debugging and inspection blocking
 * - Runtime environment validation
 * - Emergency kill switch capability
 * - Code theft detection and reporting
 * 
 * VIOLATION PENALTIES: Up to $500,000 in damages
 * Report violations: kyle.wade.ktw@gmail.com
 */

interface ProtectionConfig {
  enableDomainValidation: boolean;
  enableAntiDebug: boolean;
  enableSourceProtection: boolean;
  enableRuntimeChecks: boolean;
  enableFingerprinting: boolean;
  emergencyMode: boolean;
  strictMode: boolean;
}

// Enhanced protection configuration
const PROTECTION_CONFIG: ProtectionConfig = {
  enableDomainValidation: true,
  enableAntiDebug: process.env.NODE_ENV === 'production',
  enableSourceProtection: process.env.NODE_ENV === 'production',
  enableRuntimeChecks: true,
  enableFingerprinting: true,
  emergencyMode: process.env.NEXT_PUBLIC_EMERGENCY_MODE === 'true',
  strictMode: process.env.NODE_ENV === 'production'
};

// Unique build fingerprint
const CODE_FINGERPRINT = `dayboard_${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}_${Date.now()}`;

/**
 * 🚨 EMERGENCY KILL SWITCH
 */
function checkEmergencyMode(): void {
  if (PROTECTION_CONFIG.emergencyMode && typeof window !== 'undefined') {
    document.body.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        font-family: Arial, sans-serif; 
        background: #f5f5f5;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1 style="color: #333; margin-bottom: 20px;">🔧 Maintenance Mode</h1>
          <p style="color: #666; font-size: 18px;">
            Service temporarily unavailable for scheduled maintenance.
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            Please check back shortly.
          </p>
        </div>
      </div>
    `;
    throw new Error('Emergency maintenance mode activated');
  }
}

/**
 * 🌐 ENHANCED DOMAIN VALIDATION
 */
export function validateDomain(): boolean {
  if (typeof window === 'undefined') return true;

  const authorizedDomains = [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    'bentlolabs.com',
    'www.bentlolabs.com',
  ];

  const developmentPatterns = [
    '.vercel.app',
    '.netlify.app',
    '.railway.app'
  ];

  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;

  // Allow development environments
  if (currentDomain.includes('localhost') || 
      currentDomain.includes('127.0.0.1') || 
      process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Check authorized domains
  const isAuthorized = authorizedDomains.some(domain => 
    currentDomain === domain || currentDomain.endsWith('.' + domain)
  );

  if (isAuthorized) {
    return true;
  }

  // Check development patterns (staging only)
  if (process.env.NODE_ENV !== 'production') {
    const isDevelopment = developmentPatterns.some(pattern => 
      currentDomain.endsWith(pattern)
    );
    if (isDevelopment) return true;
  }

  // 🚨 UNAUTHORIZED ACCESS DETECTED
  console.error('🛡️ UNAUTHORIZED DOMAIN:', currentDomain);
  
  // Report violation
  reportSecurityViolation({
    type: 'unauthorized_domain',
    domain: currentDomain,
    origin: currentOrigin,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    fingerprint: generateDeviceFingerprint()
  });

  if (PROTECTION_CONFIG.strictMode) {
    redirectToSecurityPage();
  }

  return false;
}

/**
 * 🐛 ANTI-DEBUGGING PROTECTION
 */
function initAntiDebug(): void {
  if (!PROTECTION_CONFIG.enableAntiDebug || typeof window === 'undefined') return;

  let debuggerDetected = false;
  
  // Detect debugger with timing attack
  const checkDebugger = () => {
    const start = performance.now();
    debugger;
    const end = performance.now();
    
    if (end - start > 100 && !debuggerDetected) {
      debuggerDetected = true;
      console.warn('🚨 Debugging attempt detected');
      reportSecurityViolation({
        type: 'debugger_detected',
        timestamp: new Date().toISOString()
      });
      
      if (PROTECTION_CONFIG.strictMode) {
        window.location.href = 'about:blank';
      }
    }
  };

  // Run checks periodically
  setInterval(checkDebugger, 3000);

  // Detect DevTools by window size changes
  let devToolsOpen = false;
  const checkDevTools = () => {
    const threshold = 160;
    const isOpen = window.outerHeight - window.innerHeight > threshold || 
                   window.outerWidth - window.innerWidth > threshold;
    
    if (isOpen && !devToolsOpen) {
      devToolsOpen = true;
      console.warn('🚨 Developer tools detected');
      reportSecurityViolation({
        type: 'devtools_detected',
        timestamp: new Date().toISOString()
      });
    } else if (!isOpen) {
      devToolsOpen = false;
    }
  };

  setInterval(checkDevTools, 1000);
}

/**
 * 🔒 SOURCE CODE PROTECTION
 */
function initSourceProtection(): void {
  if (!PROTECTION_CONFIG.enableSourceProtection || typeof window === 'undefined') return;

  // Block common inspection shortcuts
  document.addEventListener('keydown', (e) => {
    const blocked = [
      e.key === 'F12',
      e.ctrlKey && e.shiftKey && e.key === 'I', // DevTools
      e.ctrlKey && e.shiftKey && e.key === 'C', // Inspector
      e.ctrlKey && e.key === 'U', // View Source
      e.ctrlKey && e.key === 'S', // Save Page
      e.ctrlKey && e.shiftKey && e.key === 'J' // Console
    ];

    if (blocked.some(condition => condition)) {
      e.preventDefault();
      e.stopPropagation();
      console.warn('🚨 Source inspection blocked');
      reportSecurityViolation({
        type: 'inspection_attempt',
        key: e.key,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  });

  // Disable right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.warn('🚨 Context menu blocked');
    return false;
  });

  // Disable text selection in production
  if (PROTECTION_CONFIG.strictMode) {
    document.addEventListener('selectstart', (e) => {
      if (!(e.target as Element).closest('input, textarea')) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Clear console periodically
  if (PROTECTION_CONFIG.strictMode) {
    setInterval(() => {
      console.clear();
    }, 10000);
  }
}

/**
 * 🤖 RUNTIME ENVIRONMENT VALIDATION
 */
function validateRuntimeEnvironment(): boolean {
  if (!PROTECTION_CONFIG.enableRuntimeChecks || typeof window === 'undefined') return true;

  const suspiciousIndicators = [
    'webdriver' in window,
    'callPhantom' in window,
    'callSelenium' in window,
    '_phantom' in window,
    'phantom' in window,
    navigator.webdriver === true,
    navigator.languages.length === 0,
    navigator.userAgent.includes('HeadlessChrome'),
    window.outerWidth === 0,
    window.outerHeight === 0
  ];

  if (suspiciousIndicators.some(indicator => indicator)) {
    console.warn('🚨 Suspicious runtime environment detected');
    reportSecurityViolation({
      type: 'suspicious_environment',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    return false;
  }

  return true;
}

/**
 * 🔢 CODE FINGERPRINTING
 */
function initCodeFingerprinting(): void {
  if (!PROTECTION_CONFIG.enableFingerprinting || typeof window === 'undefined') return;

  // Set application fingerprint
  (window as any)[CODE_FINGERPRINT] = {
    initialized: Date.now(),
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    build: process.env.NEXT_PUBLIC_BUILD_ID,
    domain: window.location.hostname
  };

  // Validate expected environment
  const expectedGlobals = ['React', 'next'];
  const missingGlobals = expectedGlobals.filter(global => !(global in window));
  
  if (missingGlobals.length > 0) {
    console.warn('🚨 Missing expected globals:', missingGlobals);
    reportSecurityViolation({
      type: 'missing_globals',
      missing: missingGlobals,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 🚨 SECURITY VIOLATION REPORTING
 */
function reportSecurityViolation(violation: any): void {
  if (process.env.NODE_ENV !== 'production') return;

  // Send to security endpoint
  fetch('/api/security/violation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...violation,
      url: window.location.href,
      referrer: document.referrer,
      fingerprint: generateDeviceFingerprint()
    })
  }).catch(() => {}); // Silent fail

  // Also log locally for debugging
  console.error('Security violation reported:', violation);
}

/**
 * 🔍 DEVICE FINGERPRINTING
 */
function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.cookieEnabled
  ];

  return btoa(components.join('|')).slice(0, 16);
}

/**
 * 🚪 SECURITY REDIRECT
 */
function redirectToSecurityPage(): void {
  setTimeout(() => {
    window.location.href = '/security-violation';
  }, 2000);
}

/**
 * 📜 ENHANCED COPYRIGHT PROTECTION
 */
export function addCopyrightProtection(): void {
  if (typeof window === 'undefined') return;

  // Enhanced console warnings
  const styles = {
    title: 'color: #ff0000; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);',
    warning: 'color: #ff6600; font-size: 14px; font-weight: bold;',
    info: 'color: #0066cc; font-size: 12px;',
    contact: 'color: #00aa00; font-weight: bold;'
  };

  console.log('%c🛡️ DAYBOARD - PROPRIETARY SOFTWARE', styles.title);
  console.log('%c⚖️ COPYRIGHT PROTECTED CODE', styles.warning);
  console.log('%c© 2025 Kyle Wade / BentloLabs - All Rights Reserved', styles.info);
  console.log('%cUnauthorized use is strictly prohibited and may result in legal action.', styles.warning);
  console.log('%cViolation penalties: Up to $500,000 in damages', styles.warning);
  console.log('%c📧 Report violations: kyle.wade.ktw@gmail.com', styles.contact);
  console.log('%c🌐 Licensed for use only on: bentlolabs.com', styles.info);

  // Add invisible watermarks
  const watermark = document.createElement('div');
  watermark.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;';
  watermark.setAttribute('data-copyright', `© 2025 Kyle Wade - Dayboard v${process.env.NEXT_PUBLIC_APP_VERSION}`);
  watermark.setAttribute('data-fingerprint', CODE_FINGERPRINT);
  watermark.setAttribute('data-license', 'PROPRIETARY-COMMERCIAL');
  document.body.appendChild(watermark);

  // Monitor for tampering
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        Array.from(mutation.removedNodes).forEach((node) => {
          if (node instanceof Element && 
              (node.hasAttribute('data-copyright') || 
               node.hasAttribute('data-fingerprint'))) {
            reportSecurityViolation({
              type: 'copyright_tampering',
              timestamp: new Date().toISOString()
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * 🚀 INITIALIZE ALL PROTECTION LAYERS
 */
export function initializeProtection(): boolean {
  try {
    // Check emergency mode first
    checkEmergencyMode();

    // Validate domain
    if (!validateDomain()) {
      return false;
    }

    // Validate runtime environment
    if (!validateRuntimeEnvironment()) {
      return false;
    }

    // Initialize protection layers
    initAntiDebug();
    initSourceProtection();
    initCodeFingerprinting();
    addCopyrightProtection();

    console.log('🛡️ Protection system initialized');
    return true;

  } catch (error) {
    console.error('Protection system error:', error);
    return false;
  }
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  initializeProtection();
}

export default {
  validateDomain,
  addCopyrightProtection,
  initializeProtection
};
