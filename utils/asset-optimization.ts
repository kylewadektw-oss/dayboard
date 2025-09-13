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

import { enhancedLogger, LogLevel } from '@/utils/logger';

// 🚀 PERFORMANCE: Asset loading priorities
export const AssetPriority = {
  CRITICAL: 'high',     // Above-the-fold content
  IMPORTANT: 'medium',  // Important but not critical
  LOW: 'low',          // Below-the-fold content
  LAZY: 'lazy'         // Load when needed
} as const;

type AssetPriorityType = typeof AssetPriority[keyof typeof AssetPriority];

// 🚀 PERFORMANCE: Image optimization utilities
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: AssetPriorityType;
  placeholder?: 'blur' | 'empty';
  quality?: number;
  sizes?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// 🚀 PERFORMANCE: Preload critical resources
interface PreloadResource {
  href: string;
  as: 'image' | 'font' | 'script' | 'style';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
}

class AssetOptimizer {
  private preloadedResources = new Set<string>();
  private loadedFonts = new Set<string>();
  private imageCache = new Map<string, HTMLImageElement>();
  private intersectionObserver?: IntersectionObserver;

  constructor() {
    this.initializeIntersectionObserver();
    this.initializeFontLoading();
  }

  // 🚀 PERFORMANCE: Initialize intersection observer for lazy loading
  private initializeIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const src = target.dataset.src;
            
            if (src) {
              this.loadImage(src, target as HTMLImageElement);
              this.intersectionObserver?.unobserve(target);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );
  }

  // 🚀 PERFORMANCE: Initialize font loading optimization
  private initializeFontLoading() {
    if (typeof window === 'undefined' || !('fonts' in document)) {
      return;
    }

    // Preload critical fonts
    this.preloadFont('/fonts/inter-var.woff2', 'Inter', 'swap');
  }

  // 🚀 PERFORMANCE: Preload critical resources
  preloadResource(resource: PreloadResource): void {
    if (typeof window === 'undefined' || this.preloadedResources.has(resource.href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) link.type = resource.type;
    if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
    if (resource.media) link.media = resource.media;

    document.head.appendChild(link);
    this.preloadedResources.add(resource.href);

    enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'Resource preloaded',
      'AssetOptimizer',
      { href: resource.href, as: resource.as }
    );
  }

  // 🚀 PERFORMANCE: Preload multiple resources
  preloadResources(resources: PreloadResource[]): void {
    resources.forEach(resource => this.preloadResource(resource));
  }

  // 🚀 PERFORMANCE: Font loading optimization
  async preloadFont(
    href: string, 
    fontFamily: string, 
    fontDisplay: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' = 'swap'
  ): Promise<void> {
    if (typeof window === 'undefined' || this.loadedFonts.has(href)) {
      return;
    }

    try {
      // Preload the font file
      this.preloadResource({
        href,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      });

      // Use Font Loading API if available
      if ('fonts' in document) {
        const font = new FontFace(fontFamily, `url(${href})`, {
          display: fontDisplay
        });

        await font.load();
        document.fonts.add(font);
        
        this.loadedFonts.add(href);

        enhancedLogger.logWithFullContext(
          LogLevel.INFO,
          'Font loaded successfully',
          'AssetOptimizer',
          { fontFamily, href }
        );
      }
    } catch (error) {
      enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'Font loading failed',
        'AssetOptimizer',
        { 
          fontFamily, 
          href, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      );
    }
  }

  // 🚀 PERFORMANCE: Optimized image loading
  loadImage(src: string, imgElement?: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cachedImage = this.imageCache.get(src);
      if (cachedImage && cachedImage.complete) {
        if (imgElement) {
          imgElement.src = src;
          imgElement.classList.remove('loading');
          imgElement.classList.add('loaded');
        }
        resolve(cachedImage);
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        this.imageCache.set(src, img);
        
        if (imgElement) {
          imgElement.src = src;
          imgElement.classList.remove('loading');
          imgElement.classList.add('loaded');
        }
        
        resolve(img);
      };

      img.onerror = () => {
        if (imgElement) {
          imgElement.classList.remove('loading');
          imgElement.classList.add('error');
        }
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  // 🚀 PERFORMANCE: Lazy load image with intersection observer
  lazyLoadImage(imgElement: HTMLImageElement, src: string): void {
    if (!this.intersectionObserver) {
      // Fallback: load immediately
      this.loadImage(src, imgElement);
      return;
    }

    imgElement.dataset.src = src;
    imgElement.classList.add('loading');
    this.intersectionObserver.observe(imgElement);
  }

  // 🚀 PERFORMANCE: Optimized image component factory
  createOptimizedImage(props: OptimizedImageProps): HTMLImageElement {
    const img = document.createElement('img');
    
    img.alt = props.alt;
    img.className = `optimized-image ${props.className || ''}`;
    
    // Set dimensions if provided
    if (props.width) img.width = props.width;
    if (props.height) img.height = props.height;

    // Handle loading based on priority
    if (props.priority === AssetPriority.CRITICAL) {
      // Load immediately for critical images
      img.src = props.src;
      if (props.onLoad) img.onload = props.onLoad;
      if (props.onError) img.onerror = props.onError;
    } else {
      // Lazy load for non-critical images
      this.lazyLoadImage(img, props.src);
      if (props.onLoad) {
        img.addEventListener('load', props.onLoad);
      }
      if (props.onError) {
        img.addEventListener('error', props.onError);
      }
    }

    return img;
  }

  // 🚀 PERFORMANCE: Preload critical images
  preloadCriticalImages(imageSrcs: string[]): void {
    imageSrcs.forEach(src => {
      this.preloadResource({
        href: src,
        as: 'image'
      });
    });
  }

  // 🚀 PERFORMANCE: Generate responsive image srcSet
  generateSrcSet(basePath: string, sizes: number[]): string {
    return sizes
      .map(size => `${basePath}?w=${size} ${size}w`)
      .join(', ');
  }

  // 🚀 PERFORMANCE: Generate sizes attribute for responsive images
  generateSizes(breakpoints: { [key: string]: string }): string {
    return Object.entries(breakpoints)
      .map(([breakpoint, size]) => `(${breakpoint}) ${size}`)
      .join(', ');
  }

  // 🚀 PERFORMANCE: CSS optimization utilities
  inlineCriticalCSS(css: string): void {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }

  // 🚀 PERFORMANCE: Load non-critical CSS asynchronously
  loadNonCriticalCSS(href: string): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  // 🚀 PERFORMANCE: Service worker registration for caching
  async registerServiceWorker(swPath: string = '/sw.js'): Promise<void> {
    if (
      typeof window === 'undefined' || 
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(swPath);
      
      enhancedLogger.logWithFullContext(
        LogLevel.INFO,
        'Service worker registered successfully',
        'AssetOptimizer',
        { scope: registration.scope }
      );
    } catch (error) {
      enhancedLogger.logWithFullContext(
        LogLevel.ERROR,
        'Service worker registration failed',
        'AssetOptimizer',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // 🚀 PERFORMANCE: Clear image cache
  clearImageCache(): void {
    this.imageCache.clear();
  }

  // 🚀 PERFORMANCE: Get cache statistics
  getCacheStats() {
    return {
      preloadedResources: this.preloadedResources.size,
      loadedFonts: this.loadedFonts.size,
      cachedImages: this.imageCache.size
    };
  }
}

// 🚀 PERFORMANCE: Utility functions for asset optimization
export const assetOptimizer = new AssetOptimizer();

// 🚀 PERFORMANCE: React component helpers
export const OptimizedImage = (props: OptimizedImageProps) => {
  const {
    src,
    alt,
    width,
    height,
    priority = AssetPriority.LOW,
    quality = 75,
    sizes,
    className = '',
    ...rest
  } = props;

  // Generate optimized src
  const optimizedSrc = `${src}?q=${quality}${width ? `&w=${width}` : ''}${height ? `&h=${height}` : ''}`;

  const imageProps = {
    src: optimizedSrc,
    alt,
    width,
    height,
    className: `transition-opacity duration-300 ${className}`,
    loading: priority === AssetPriority.CRITICAL ? 'eager' as const : 'lazy' as const,
    decoding: 'async' as const,
    ...(sizes && { sizes }),
    ...rest
  };

  return imageProps;
};

// 🚀 PERFORMANCE: Critical resource preloader
export const preloadCriticalResources = () => {
  // Preload critical fonts
  assetOptimizer.preloadFont('/fonts/inter-var.woff2', 'Inter', 'swap');

  // Preload critical images
  assetOptimizer.preloadCriticalImages([
    '/logo.svg',
    '/favicon.ico'
  ]);

  // Preload critical CSS
  assetOptimizer.preloadResource({
    href: '/styles/critical.css',
    as: 'style'
  });
};

// 🚀 PERFORMANCE: Initialize asset optimization
export const initializeAssetOptimization = () => {
  if (typeof window === 'undefined') return;

  // Preload critical resources
  preloadCriticalResources();

  // Register service worker for caching
  assetOptimizer.registerServiceWorker();

  // Load non-critical CSS
  assetOptimizer.loadNonCriticalCSS('/styles/non-critical.css');
};

// 🚀 PERFORMANCE: Export utilities
export {
  AssetOptimizer
};

export type {
  OptimizedImageProps
};

export default assetOptimizer;