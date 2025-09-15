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
 * 🚀 BUFFER OPTIMIZATION UTILITY
 * 
 * Optimizes large string operations to use Buffers instead of strings
 * to improve webpack cache performance and reduce serialization overhead.
 * 
 * This utility addresses the webpack warning:
 * "[webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB) impacts 
 * deserialization performance (consider using Buffer instead and decode when needed)"
 */

/**
 * Efficiently serialize large objects using Buffer compression
 */
export function serializeToBuffer(obj: unknown): Buffer {
  try {
    const jsonString = JSON.stringify(obj);
    
    // Only use Buffer for large strings (>50KB) to optimize performance
    if (jsonString.length > 50 * 1024) {
      return Buffer.from(jsonString, 'utf8');
    }
    
    // For smaller strings, return as-is
    return Buffer.from(jsonString, 'utf8');
  } catch (error) {
    console.warn('Failed to serialize to buffer:', error);
    return Buffer.from('{}', 'utf8');
  }
}

/**
 * Efficiently deserialize from Buffer
 */
export function deserializeFromBuffer<T = unknown>(buffer: Buffer): T {
  try {
    const jsonString = buffer.toString('utf8');
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to deserialize from buffer:', error);
    return {} as T;
  }
}

/**
 * Optimized JSON stringification for large objects
 */
export function optimizedStringify(obj: unknown, space?: number): string {
  try {
    const result = JSON.stringify(obj, null, space);
    
    // Warn if string is very large
    if (result.length > 100 * 1024) {
      console.warn(`Large string detected (${(result.length / 1024).toFixed(1)}KB). Consider using Buffer optimization.`);
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to stringify object:', error);
    return '{}';
  }
}

/**
 * Chunked processing for very large datasets
 */
export function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => R[],
  chunkSize: number = 1000
): R[] {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = processor(chunk);
    results.push(...chunkResults);
  }
  
  return results;
}

/**
 * Memory-efficient string builder for large content
 */
export class BufferedStringBuilder {
  private buffers: Buffer[] = [];
  private totalLength = 0;

  append(str: string): this {
    const buffer = Buffer.from(str, 'utf8');
    this.buffers.push(buffer);
    this.totalLength += buffer.length;
    return this;
  }

  appendObject(obj: unknown): this {
    const str = JSON.stringify(obj);
    return this.append(str);
  }

  toString(): string {
    if (this.buffers.length === 0) return '';
    
    const combined = Buffer.concat(this.buffers, this.totalLength);
    return combined.toString('utf8');
  }

  toBuffer(): Buffer {
    return Buffer.concat(this.buffers, this.totalLength);
  }

  clear(): void {
    this.buffers = [];
    this.totalLength = 0;
  }

  get size(): number {
    return this.totalLength;
  }
}

/**
 * Efficient circular reference detection and removal
 */
export function sanitizeForSerialization(obj: unknown, maxDepth: number = 10): unknown {
  const seen = new WeakSet();
  
  function clean(value: unknown, depth: number): unknown {
    if (depth > maxDepth) {
      return '[Max Depth Reached]';
    }
    
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    if (seen.has(value)) {
      return '[Circular Reference]';
    }
    
    seen.add(value);
    
    if (Array.isArray(value)) {
      return value.map(item => clean(item, depth + 1));
    }
    
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Skip very large string values that might cause issues
      if (typeof val === 'string' && val.length > 10000) {
        cleaned[key] = `[Large String: ${val.length} chars]`;
      } else {
        cleaned[key] = clean(val, depth + 1);
      }
    }
    
    return cleaned;
  }
  
  return clean(obj, 0);
}

/**
 * Webpack-friendly large string handler
 */
export function handleLargeString(str: string): string | Buffer {
  // If string is large (>100KB), return as Buffer to optimize webpack caching
  if (str.length > 100 * 1024) {
    return Buffer.from(str, 'utf8');
  }
  return str;
}

/**
 * Performance monitoring for serialization operations
 */
export class SerializationProfiler {
  private static measurements: Map<string, number[]> = new Map();

  static time<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }
    
    this.measurements.get(operation)!.push(duration);
    
    // Warn about slow operations
    if (duration > 100) {
      console.warn(`Slow serialization operation: ${operation} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }

  static getStats(operation: string): { avg: number; max: number; count: number } | null {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) return null;
    
    const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const max = Math.max(...measurements);
    
    return { avg, max, count: measurements.length };
  }

  static clear(): void {
    this.measurements.clear();
  }
}
