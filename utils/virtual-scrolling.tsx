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

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { createOptimizedDebounce } from '@/utils/performance';

// 🚀 PERFORMANCE: Virtual list item interface
export interface VirtualListItem {
  id: string | number;
  height?: number;
  data: any;
}

// 🚀 PERFORMANCE: Virtual scrolling configuration
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside viewport
  getItemHeight?: (index: number, item: VirtualListItem) => number;
  onScroll?: (scrollTop: number, scrollDirection: 'up' | 'down') => void;
  scrollBehavior?: 'smooth' | 'auto';
}

// 🚀 PERFORMANCE: Virtual scroll hook
export function useVirtualScroll<T extends VirtualListItem>(
  items: T[],
  config: VirtualScrollConfig
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    getItemHeight,
    onScroll,
    scrollBehavior = 'auto'
  } = config;

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  // 🚀 PERFORMANCE: Memoized calculations
  const scrollMetrics = useMemo(() => {
    const totalHeight = items.reduce((total, item, index) => {
      return total + (getItemHeight ? getItemHeight(index, item) : itemHeight);
    }, 0);

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );

    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);

    const offsetY = startIndex * itemHeight;

    return {
      totalHeight,
      startIndex,
      endIndex,
      visibleItems,
      offsetY,
      visibleCount: endIndex - startIndex + 1
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan, getItemHeight]);

  // 🚀 PERFORMANCE: Debounced scroll handler
  const debouncedScrollHandler = useCallback(
    createOptimizedDebounce((event: Event) => {
      const target = event.target as HTMLElement;
      const newScrollTop = target.scrollTop;
      
      setScrollDirection(newScrollTop > lastScrollTop.current ? 'down' : 'up');
      setScrollTop(newScrollTop);
      lastScrollTop.current = newScrollTop;
      
      onScroll?.(newScrollTop, newScrollTop > lastScrollTop.current ? 'down' : 'up');
    }, 16), // ~60fps
    [onScroll]
  );

  // 🚀 PERFORMANCE: Scroll event listener
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    element.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', debouncedScrollHandler);
    };
  }, [debouncedScrollHandler]);

  // 🚀 PERFORMANCE: Scroll to item utility
  const scrollToItem = useCallback((index: number, behavior: ScrollBehavior = scrollBehavior) => {
    const element = scrollRef.current;
    if (!element || index < 0 || index >= items.length) return;

    const targetScrollTop = index * itemHeight;
    element.scrollTo({ top: targetScrollTop, behavior });
  }, [items.length, itemHeight, scrollBehavior]);

  // 🚀 PERFORMANCE: Scroll to top utility
  const scrollToTop = useCallback((behavior: ScrollBehavior = scrollBehavior) => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollTo({ top: 0, behavior });
  }, [scrollBehavior]);

  return {
    scrollRef,
    scrollMetrics,
    scrollToItem,
    scrollToTop,
    scrollDirection,
    scrollTop
  };
}

// 🚀 PERFORMANCE: Virtual list component props
interface VirtualListProps<T extends VirtualListItem> {
  items: T[];
  config: VirtualScrollConfig;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyStateComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  onItemClick?: (item: T, index: number) => void;
}

// 🚀 PERFORMANCE: Optimized virtual list component
function VirtualListComponent<T extends VirtualListItem>({
  items,
  config,
  renderItem,
  className = '',
  emptyStateComponent,
  loadingComponent,
  isLoading = false,
  onItemClick
}: VirtualListProps<T>) {
  const { scrollRef, scrollMetrics } = useVirtualScroll(items, config);

  // 🚀 PERFORMANCE: Memoized item click handler
  const handleItemClick = useCallback((item: T, index: number) => {
    onItemClick?.(item, index);
  }, [onItemClick]);

  // 🚀 PERFORMANCE: Memoized rendered items
  const renderedItems = useMemo(() => {
    return scrollMetrics.visibleItems.map((item, virtualIndex) => {
      const actualIndex = scrollMetrics.startIndex + virtualIndex;
      return (
        <div
          key={item.id}
          onClick={() => handleItemClick(item, actualIndex)}
          style={{ 
            position: 'absolute',
            top: (scrollMetrics.startIndex + virtualIndex) * config.itemHeight,
            left: 0,
            right: 0,
            height: config.getItemHeight ? config.getItemHeight(actualIndex, item) : config.itemHeight
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [
    scrollMetrics.visibleItems, 
    scrollMetrics.startIndex, 
    config.itemHeight, 
    config.getItemHeight,
    renderItem, 
    handleItemClick
  ]);

  if (isLoading && loadingComponent) {
    return <div className={className}>{loadingComponent}</div>;
  }

  if (items.length === 0 && emptyStateComponent) {
    return <div className={className}>{emptyStateComponent}</div>;
  }

  return (
    <div
      ref={scrollRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: config.containerHeight }}
    >
      {/* Virtual spacer */}
      <div style={{ height: scrollMetrics.totalHeight, position: 'relative' }}>
        {renderedItems}
      </div>
    </div>
  );
}

// 🚀 PERFORMANCE: Export memoized component
export const VirtualList = memo(VirtualListComponent) as <T extends VirtualListItem>(
  props: VirtualListProps<T>
) => JSX.Element;

// 🚀 PERFORMANCE: Optimized grid virtual scrolling
interface VirtualGridConfig extends Omit<VirtualScrollConfig, 'itemHeight'> {
  itemWidth: number;
  itemHeight: number;
  columns: number;
  gap?: number;
}

export function useVirtualGrid<T extends VirtualListItem>(
  items: T[],
  config: VirtualGridConfig
) {
  const { itemWidth, itemHeight, columns, gap = 0 } = config;
  
  // Convert grid to list logic
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  
  const modifiedConfig: VirtualScrollConfig = {
    ...config,
    itemHeight: rowHeight
  };

  const virtualScroll = useVirtualScroll(items, modifiedConfig);

  // 🚀 PERFORMANCE: Grid-specific calculations
  const gridMetrics = useMemo(() => {
    const startRow = Math.floor(virtualScroll.scrollMetrics.startIndex);
    const endRow = Math.ceil(virtualScroll.scrollMetrics.endIndex);
    
    const startItemIndex = startRow * columns;
    const endItemIndex = Math.min(items.length - 1, (endRow + 1) * columns - 1);
    
    const visibleItems = items.slice(startItemIndex, endItemIndex + 1);
    
    return {
      ...virtualScroll.scrollMetrics,
      startRow,
      endRow,
      startItemIndex,
      endItemIndex,
      visibleItems,
      totalRows,
      columns,
      itemWidth,
      itemHeight,
      gap
    };
  }, [virtualScroll.scrollMetrics, items, columns, itemWidth, itemHeight, gap, totalRows]);

  return {
    ...virtualScroll,
    gridMetrics
  };
}

// 🚀 PERFORMANCE: Virtual grid component
interface VirtualGridProps<T extends VirtualListItem> {
  items: T[];
  config: VirtualGridConfig;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyStateComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  onItemClick?: (item: T, index: number) => void;
}

function VirtualGridComponent<T extends VirtualListItem>({
  items,
  config,
  renderItem,
  className = '',
  emptyStateComponent,
  loadingComponent,
  isLoading = false,
  onItemClick
}: VirtualGridProps<T>) {
  const { scrollRef, gridMetrics } = useVirtualGrid(items, config);

  // 🚀 PERFORMANCE: Memoized grid items
  const renderedItems = useMemo(() => {
    return gridMetrics.visibleItems.map((item, virtualIndex) => {
      const actualIndex = gridMetrics.startItemIndex + virtualIndex;
      const row = Math.floor(actualIndex / gridMetrics.columns);
      const col = actualIndex % gridMetrics.columns;
      
      return (
        <div
          key={item.id}
          onClick={() => onItemClick?.(item, actualIndex)}
          style={{
            position: 'absolute',
            left: col * (gridMetrics.itemWidth + gridMetrics.gap),
            top: row * (gridMetrics.itemHeight + gridMetrics.gap),
            width: gridMetrics.itemWidth,
            height: gridMetrics.itemHeight
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [gridMetrics, renderItem, onItemClick]);

  if (isLoading && loadingComponent) {
    return <div className={className}>{loadingComponent}</div>;
  }

  if (items.length === 0 && emptyStateComponent) {
    return <div className={className}>{emptyStateComponent}</div>;
  }

  return (
    <div
      ref={scrollRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: config.containerHeight }}
    >
      <div style={{ 
        height: gridMetrics.totalRows * (gridMetrics.itemHeight + gridMetrics.gap),
        position: 'relative',
        width: gridMetrics.columns * (gridMetrics.itemWidth + gridMetrics.gap)
      }}>
        {renderedItems}
      </div>
    </div>
  );
}

// 🚀 PERFORMANCE: Export memoized grid component
export const VirtualGrid = memo(VirtualGridComponent) as <T extends VirtualListItem>(
  props: VirtualGridProps<T>
) => JSX.Element;

// 🚀 PERFORMANCE: Export utilities
export default {
  VirtualList,
  VirtualGrid,
  useVirtualScroll,
  useVirtualGrid
};