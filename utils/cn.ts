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

/*
 * 🎨 CLASS NAME UTILITY - Tailwind CSS Class Merging
 *
 * PURPOSE: Intelligently merges and deduplicates Tailwind CSS class names
 * Prevents conflicts and ensures optimal CSS class application throughout the application
 *
 * FEATURES:
 * - Smart class name merging with conflict resolution
 * - Tailwind CSS class deduplication
 * - Conditional class application support
 * - Type-safe class name handling
 * - Performance-optimized merging algorithm
 *
 * USAGE:
 * ```typescript
 * import { cn } from '@/utils/cn';
 *
 * // Basic merging
 * const classes = cn('bg-blue-500', 'text-white', 'px-4 py-2');
 *
 * // Conditional classes
 * const buttonClasses = cn(
 *   'px-4 py-2 rounded',
 *   isActive && 'bg-blue-500 text-white',
 *   isDisabled && 'opacity-50 cursor-not-allowed',
 *   className // Allow prop overrides
 * );
 *
 * // Conflict resolution (later classes override earlier ones)
 * const merged = cn('bg-red-500', 'bg-blue-500'); // Results in 'bg-blue-500'
 * ```
 *
 * BENEFITS:
 * - Prevents duplicate CSS classes
 * - Resolves Tailwind class conflicts intelligently
 * - Supports conditional class application
 * - Maintains type safety with TypeScript
 * - Optimizes final CSS bundle size
 *
 * TECHNICAL:
 * - Built on clsx for conditional class handling
 * - Uses tailwind-merge for intelligent conflict resolution
 * - Handles arrays, objects, and string class formats
 * - Removes duplicate and conflicting classes
 *
 * ACCESS: Used extensively throughout UI components and styling
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
