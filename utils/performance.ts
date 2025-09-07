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
 * 🛠️ PERFORMANCE UTILITY - Helper Functions
 * 
 * PURPOSE: Utility functions and helpers for performance functionality
 * 
 * EXPORTS:
 * - [List main functions and classes]
 * - [Constants and type definitions]
 * - [Helper utilities and tools]
 * 
 * USAGE:
 * ```typescript
 * import { functionName } from '@/utils/performance';
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
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

// Performance optimization utilities for the Dayboard app

import React from 'react';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): T {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  const later = () => {
    timeout = null;
    if (options?.trailing !== false && lastArgs) {
      func.apply(null, lastArgs);
    }
  };

  return ((...args: Parameters<T>) => {
    lastArgs = args;
    const callNow = options?.leading && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(null, args);
    }
  }) as T;
}

// Simple throttle implementation
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(null, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(null, args);
      }, remaining);
    }
  }) as T;
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure function execution time
  measureExecution<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start);
    return result;
  }

  // Measure async function execution time
  async measureAsyncExecution<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric(name, end - start);
    return result;
  }

  private recordMetric(name: string, time: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const times = this.metrics.get(name)!;
    times.push(time);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  // Get performance stats
  getStats(name: string) {
    const times = this.metrics.get(name) || [];
    if (times.length === 0) return null;

    const sorted = [...times].sort((a, b) => a - b);
    return {
      count: times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: times.reduce((a, b) => a + b, 0) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)]
    };
  }

  // Get all performance stats
  getAllStats() {
    const stats: Record<string, any> = {};
    this.metrics.forEach((value, name) => {
      stats[name] = this.getStats(name);
    });
    return stats;
  }
}

// Optimized debounce and throttle utilities
export const createOptimizedDebounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  options?: { leading?: boolean; trailing?: boolean }
): T => {
  return debounce(func, wait, options) as T;
};

export const createOptimizedThrottle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = 100
): T => {
  return throttle(func, wait) as T;
};

// Component performance wrapper
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  name: string
) => {
  return (props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    
    return monitor.measureExecution(`Component:${name}`, () => 
      React.createElement(Component, props)
    );
  };
};

// Virtual scrolling helper
export class VirtualScroller {
  private containerHeight: number;
  private itemHeight: number;
  private scrollTop: number;
  private totalItems: number;

  constructor(containerHeight: number, itemHeight: number, totalItems: number) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.scrollTop = 0;
    this.totalItems = totalItems;
  }

  updateScroll(scrollTop: number) {
    this.scrollTop = scrollTop;
  }

  getVisibleRange(overscan: number = 5) {
    const visibleStart = Math.floor(this.scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(this.containerHeight / this.itemHeight),
      this.totalItems
    );

    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(this.totalItems, visibleEnd + overscan),
      visibleStart,
      visibleEnd
    };
  }

  getTotalHeight() {
    return this.totalItems * this.itemHeight;
  }

  getOffsetY(index: number) {
    return index * this.itemHeight;
  }
}

// Memory management utilities
export const createMemoryOptimizedArray = <T>(maxSize: number = 1000) => {
  let items: T[] = [];

  return {
    push: (item: T) => {
      items.push(item);
      if (items.length > maxSize) {
        items = items.slice(-maxSize);
      }
    },
    get: () => [...items],
    clear: () => { items = []; },
    size: () => items.length
  };
};

// Bundle size optimization helpers
export const lazyImport = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

// Image optimization helper
export const createOptimizedImageLoader = (src: string, quality: number = 75) => {
  if (typeof window === 'undefined') return src;
  
  // For Next.js Image optimization
  if (src.startsWith('/') || src.startsWith('http')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=640&q=${quality}`;
  }
  
  return src;
};

// Export the performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
