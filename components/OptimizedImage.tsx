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

import Image from 'next/image';
import { useState, useRef, useEffect, memo } from 'react';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
}

// 🚀 PERFORMANCE: Optimized image component with lazy loading and error handling
function OptimizedImageComponent({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  lazy = true,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // 🚀 PERFORMANCE: Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate placeholder while loading
  const LoadingPlaceholder = () => (
    <div
      className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      style={{ width: width || '100%', height: height || 'auto' }}
    >
      <ImageIcon className="h-8 w-8 text-gray-400" />
    </div>
  );

  // Error state
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center border border-gray-200 ${className}`}
        style={{ width: width || '100%', height: height || 'auto' }}
      >
        <div className="text-center text-gray-500">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-xs">Image failed to load</p>
        </div>
      </div>
    );
  }

  // Don't render image until it's in view (for lazy loading)
  if (!isInView) {
    return (
      <div ref={imgRef} className={className} style={{ width, height }}>
        <LoadingPlaceholder />
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    quality,
    priority,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    placeholder,
    blurDataURL,
    sizes,
    ...props
  };

  return (
    <div ref={imgRef} className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <LoadingPlaceholder />
        </div>
      )}

      {fill ? (
        <Image {...imageProps} fill alt={alt} />
      ) : (
        <Image {...imageProps} width={width} height={height} alt={alt} />
      )}
    </div>
  );
}

// 🚀 PERFORMANCE: Memoize the component
export const OptimizedImage = memo(OptimizedImageComponent);

// 🚀 PERFORMANCE: Avatar component with optimizations
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const OptimizedAvatar = memo(function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  fallback,
  className = ''
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  };

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center font-medium text-gray-600 ${className}`}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${className}`}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className="object-cover"
        priority={size === 'lg' || size === 'xl'}
        quality={80}
        onError={() => setHasError(true)}
      />
    </div>
  );
});

// 🚀 PERFORMANCE: Hero image component with preloading
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

export const OptimizedHeroImage = memo(function OptimizedHeroImage({
  src,
  alt,
  className = '',
  overlay = false,
  children
}: HeroImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLmhQoRbcWOsNcLJjGhGrOQ8C4lfgUvgU1z4aGrJ2TmN3MZAS1oWJCAE7Rv+R/xpF7Xe7rJw=="
      />

      {overlay && <div className="absolute inset-0 bg-black bg-opacity-30" />}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
});

export default OptimizedImage;
