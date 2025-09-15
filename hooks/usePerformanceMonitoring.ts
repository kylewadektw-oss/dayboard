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

import { useEffect, useRef, useCallback, useState } from 'react';
import { performanceMonitor } from '@/utils/performance';

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

interface ExtendedNavigator extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData?: boolean;
    addEventListener?: (event: string, handler: () => void) => void;
    removeEventListener?: (event: string, handler: () => void) => void;
  };
}

// 🚀 PERFORMANCE: Component render timing hook
export function usePerformanceMonitoring(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = Date.now();
    renderStartTime.current = performance.now();
    
    return () => {
      const componentLifetime = Date.now() - mountTime.current;
      performanceMonitor.measureExecution(`${componentName}_lifetime`, () => componentLifetime);
    };
  }, [componentName]);

  const recordRenderComplete = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(`🚀 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName]);

  return { recordRenderComplete };
}

// 🚀 PERFORMANCE: API call timing hook
export function useApiPerformance() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  const measureApiCall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        [endpoint]: duration
      }));
      
      console.log(`🚀 API ${endpoint} took ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`🚀 API ${endpoint} failed after ${duration.toFixed(2)}ms`);
      
      throw error;
    }
  }, []);

  return { measureApiCall, metrics };
}

// 🚀 PERFORMANCE: Memory usage monitoring hook
export function useMemoryMonitoring(interval: number = 30000) {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return;
    }

    const updateMemoryInfo = () => {
      const memory = (performance as ExtendedPerformance).memory;
      if (memory) {
        const info = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        setMemoryInfo(info);
        console.log(`🚀 Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
}

// 🚀 PERFORMANCE: Network quality monitoring
export function useNetworkMonitoring() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const connection = (navigator as ExtendedNavigator).connection;
    
    const updateNetworkInfo = () => {
      if (connection) {
        const info = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData || false,
          timestamp: Date.now()
        };
        
        setNetworkInfo(info);
        console.log(`🚀 Network: ${connection.effectiveType}, RTT: ${connection.rtt}ms`);
      }
    };

    updateNetworkInfo();
    
    if (connection) {
      connection.addEventListener?.('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener?.('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// 🚀 PERFORMANCE: Core Web Vitals monitoring
export function useCoreWebVitals() {
  const [vitals, setVitals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          setVitals(prev => ({ ...prev, LCP: lcp }));
          console.log(`🚀 LCP: ${lcp.toFixed(2)}ms`);
        }
        
        if (entry.entryType === 'layout-shift') {
          const cls = (entry as PerformanceEntry & { value: number }).value;
          setVitals(prev => ({ ...prev, CLS: (prev.CLS || 0) + cls }));
          console.log(`🚀 CLS: ${cls.toFixed(4)}`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
    } catch {
      // Browser doesn't support these metrics
    }

    // Monitor FID (First Input Delay)
    const handleFirstInput = (entry: PerformanceEntry & { processingStart: number; startTime: number }) => {
      const fid = entry.processingStart - entry.startTime;
      setVitals(prev => ({ ...prev, FID: fid }));
      console.log(`🚀 FID: ${fid.toFixed(2)}ms`);
    };

    if ('PerformanceEventTiming' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          handleFirstInput(entry as PerformanceEntry & { processingStart: number; startTime: number });
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch {
        // Browser doesn't support FID
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return vitals;
}

// 🚀 PERFORMANCE: Bundle size monitoring
export function useBundleMonitoring() {
  const [bundleInfo, setBundleInfo] = useState<{
    jsResourceCount: number;
    totalJsSize: number;
    resources: Array<{
      name: string;
      size: number;
      loadTime: number;
    }>;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const jsResources = entries.filter((entry: PerformanceEntry) => 
        entry.name.endsWith('.js') && entry.name.includes('_next')
      );

      if (jsResources.length > 0) {
        const totalSize = jsResources.reduce((sum: number, entry: PerformanceEntry) => 
          sum + ((entry as PerformanceResourceTiming).transferSize || 0), 0
        );
        
        setBundleInfo({
          jsResourceCount: jsResources.length,
          totalJsSize: totalSize,
          resources: jsResources.map((entry: PerformanceEntry) => {
            const resourceEntry = entry as PerformanceResourceTiming;
            return {
              name: entry.name,
              size: resourceEntry.transferSize,
              loadTime: resourceEntry.responseEnd - resourceEntry.requestStart
            };
          })
        });

        console.log(`🚀 Bundle size: ${(totalSize / 1024).toFixed(2)}KB across ${jsResources.length} files`);
      }
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch {
      // Browser doesn't support resource timing
    }

    return () => observer.disconnect();
  }, []);

  return bundleInfo;
}