/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import {
  lazy,
  Suspense,
  ComponentType,
  ReactNode,
  Component,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';
import { enhancedLogger, LogLevel } from '@/utils/logger';

// 🚀 PERFORMANCE: Fallback loading components with different styles
export const LoadingFallback = ({
  type = 'default'
}: {
  type?: 'default' | 'widget' | 'page';
}) => {
  const baseClasses = 'animate-pulse';

  switch (type) {
    case 'widget':
      return (
        <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
          <div className={baseClasses}>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );

    case 'page':
      return (
        <div className="p-6 max-w-7xl mx-auto">
          <div className={baseClasses}>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`${baseClasses} space-y-4`}>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      );
  }
};

// 🚀 PERFORMANCE: Error boundary for lazy loaded components
export class LazyErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    enhancedLogger.logWithFullContext(
      LogLevel.ERROR,
      'Lazy component failed to load',
      'LazyErrorBoundary',
      { error: error.message, errorInfo }
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="text-red-800 font-medium">
              Failed to load component
            </div>
            <div className="text-red-600 text-sm mt-1">
              Please refresh the page or try again later.
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// 🚀 PERFORMANCE: Enhanced lazy loading wrapper with retry logic
interface LazyWrapperOptions {
  fallbackType?: 'default' | 'widget' | 'page';
  retryAttempts?: number;
  retryDelay?: number;
  errorFallback?: ReactNode;
  logComponentName?: string;
}

export function createLazyWrapper<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyWrapperOptions = {}
) {
  const {
    fallbackType = 'default',
    retryAttempts = 3,
    retryDelay = 1000,
    errorFallback,
    logComponentName = 'Unknown'
  } = options;

  // Retry logic for failed imports
  const importWithRetry = async (attempt = 1): Promise<{ default: T }> => {
    try {
      const start = performance.now();
      const module = await importFn();
      const loadTime = performance.now() - start;

      // Log successful lazy load
      enhancedLogger.logWithFullContext(
        LogLevel.INFO,
        `Lazy component loaded successfully`,
        'LazyLoader',
        {
          component: logComponentName,
          loadTime: `${loadTime.toFixed(2)}ms`,
          attempt
        }
      );

      return module;
    } catch (error) {
      enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        `Lazy component load attempt ${attempt} failed`,
        'LazyLoader',
        {
          component: logComponentName,
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      if (attempt < retryAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt)
        );
        return importWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  const LazyComponent = lazy(() => importWithRetry());

  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <LazyErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<LoadingFallback type={fallbackType} />}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

// 🚀 PERFORMANCE: Preload utility for critical components
export function preloadComponent<T>(importFn: () => Promise<{ default: T }>) {
  const componentPromise = importFn();

  // Preload on idle
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      componentPromise.catch(console.error);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      componentPromise.catch(console.error);
    }, 1);
  }

  return componentPromise;
}

// 🚀 PERFORMANCE: Component-specific lazy loading helpers
export const LazyMealsComponent = createLazyWrapper(
  () => import('@/components/meals/EnhancedMealPlanWrapper'),
  {
    fallbackType: 'page',
    logComponentName: 'MealsComponent',
    retryAttempts: 2
  }
);

export const LazyBudgetComponent = createLazyWrapper(
  () => import('@/components/budget/BudgetDashboard'),
  {
    fallbackType: 'page',
    logComponentName: 'BudgetComponent',
    retryAttempts: 2
  }
);

export const LazyListsComponent = createLazyWrapper(
  () => import('@/components/lists/EnhancedListsManager'),
  {
    fallbackType: 'page',
    logComponentName: 'ListsComponent',
    retryAttempts: 2
  }
);

export const LazyProjectsComponent = createLazyWrapper(
  () => import('@/components/projects/ProjectsManager'),
  {
    fallbackType: 'page',
    logComponentName: 'ProjectsComponent',
    retryAttempts: 2
  }
);

// 🚀 PERFORMANCE: Widget-specific lazy loading
export const LazyMagic8BallWidget = createLazyWrapper(
  () => import('@/components/entertainment/Magic8BallWidget'),
  {
    fallbackType: 'widget',
    logComponentName: 'Magic8BallWidget'
  }
);
export const LazyWeatherWidget = createLazyWrapper(
  () => import('@/components/dashboard/WeatherWidget'),
  {
    fallbackType: 'widget',
    logComponentName: 'WeatherWidget',
    retryAttempts: 1
  }
);

// 🚀 PERFORMANCE: Utility to get component loading priority
export const ComponentPriority = {
  CRITICAL: 'critical', // Load immediately
  HIGH: 'high', // Load on interaction
  MEDIUM: 'medium', // Load on viewport
  LOW: 'low' // Load on idle
} as const;

type Priority = (typeof ComponentPriority)[keyof typeof ComponentPriority];

export interface LazyComponentConfig {
  priority: Priority;
  preload?: boolean;
  intersectionThreshold?: number;
}

// 🚀 PERFORMANCE: Intersection observer for viewport-based loading
export function createViewportLazyWrapper<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyComponentConfig,
  options: LazyWrapperOptions = {}
) {
  const LazyComponent = createLazyWrapper(importFn, options);

  return function ViewportLazyComponent(props: React.ComponentProps<T>) {
    const [shouldLoad, setShouldLoad] = useState(
      config.priority === 'critical'
    );
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (config.priority === 'critical' || shouldLoad) return;

      const element = ref.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { threshold: config.intersectionThreshold || 0.1 }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }, [shouldLoad, config.intersectionThreshold, config.priority]);

    // Preload on hover for high priority components
    const handleMouseEnter = useCallback(() => {
      if (config.priority === 'high' && !shouldLoad) {
        setShouldLoad(true);
      }
    }, [config.priority, shouldLoad]);

    if (!shouldLoad) {
      return (
        <div
          ref={ref}
          onMouseEnter={handleMouseEnter}
          className="min-h-[100px]"
        >
          <LoadingFallback type={options.fallbackType} />
        </div>
      );
    }

    return <LazyComponent {...props} />;
  };
}

export default {
  createLazyWrapper,
  createViewportLazyWrapper,
  preloadComponent,
  LazyErrorBoundary,
  LoadingFallback,
  ComponentPriority
};
