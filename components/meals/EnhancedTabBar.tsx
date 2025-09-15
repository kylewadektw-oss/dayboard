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

'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  BookOpen, 
  Martini, 
  Clock, 
  Bookmark, 
  ShoppingCart,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface EnhancedTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const MEAL_TABS = [
  { id: 'favorites', name: 'Favorites', icon: Heart, color: 'text-green-600' },
  { id: 'this-week', name: 'This Week', icon: Calendar, color: 'text-amber-600' },
  { id: 'library', name: 'Recipe Library', icon: BookOpen, color: 'text-blue-600' },
  { id: 'cocktails', name: 'Cocktails', icon: Martini, color: 'text-purple-600' },
  { id: 'quick-meals', name: 'Quick Meals', icon: Clock, color: 'text-indigo-600' },
  { id: 'to-try', name: 'To-Try', icon: Bookmark, color: 'text-orange-600' },
  { id: 'grocery-builder', name: 'Grocery Builder', icon: ShoppingCart, color: 'text-emerald-600' }
] as const;

export function EnhancedTabBar({ activeTab, onTabChange, className = '' }: EnhancedTabBarProps) {
  const [showOverflow, setShowOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position and update scroll indicators
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
  };

  // Check if overflow is needed
  const checkOverflow = () => {
    if (!scrollContainerRef.current || !tabsContainerRef.current) return;
    
    const containerWidth = scrollContainerRef.current.clientWidth;
    const tabsWidth = tabsContainerRef.current.scrollWidth;
    setShowOverflow(tabsWidth > containerWidth);
  };

  useEffect(() => {
    const checkSizes = () => {
      checkOverflow();
      updateScrollState();
    };

    checkSizes();
    window.addEventListener('resize', checkSizes);
    
    return () => window.removeEventListener('resize', checkSizes);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200;
    const currentScroll = scrollContainerRef.current.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    scrollContainerRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Get visible tabs for main display (first 4-5 depending on screen size)
  const getVisibleTabs = () => {
    if (typeof window === 'undefined') return MEAL_TABS.slice(0, 4);
    
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    
    if (isMobile) return MEAL_TABS.slice(0, 3);
    if (isTablet) return MEAL_TABS.slice(0, 4);
    return MEAL_TABS.slice(0, 5);
  };

  const visibleTabs = getVisibleTabs();
  const overflowTabs = MEAL_TABS.slice(visibleTabs.length);

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="relative">
        {/* Main tab bar */}
        <div className="flex items-center">
          {/* Scroll left button */}
          {showOverflow && canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              className="hidden md:flex items-center justify-center w-8 h-12 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Scrollable tabs container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide"
            onScroll={updateScrollState}
          >
            <div
              ref={tabsContainerRef}
              className="flex space-x-1 md:space-x-2 px-1"
            >
              {/* Desktop: All tabs visible or scrollable */}
              <div className="hidden md:flex space-x-2">
                {MEAL_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                        isActive
                          ? `border-purple-500 ${tab.color} bg-purple-50`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile: Visible tabs + More menu */}
              <div className="flex md:hidden space-x-1 w-full">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`flex items-center px-3 py-3 text-xs font-medium border-b-2 transition-all flex-1 justify-center ${
                        isActive
                          ? `border-purple-500 ${tab.color} bg-purple-50`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="truncate">{tab.name}</span>
                    </button>
                  );
                })}

                {/* More menu for mobile overflow */}
                {overflowTabs.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowOverflow(!showOverflow)}
                      className={`flex items-center px-3 py-3 text-xs font-medium border-b-2 transition-all justify-center ${
                        overflowTabs.some(tab => tab.id === activeTab)
                          ? 'border-purple-500 text-purple-600 bg-purple-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4 mb-1" />
                      <span>More</span>
                    </button>

                    {/* Overflow menu */}
                    {showOverflow && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowOverflow(false)}
                        />
                        <div className="absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 mt-1">
                          {overflowTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            return (
                              <button
                                key={tab.id}
                                onClick={() => {
                                  onTabChange(tab.id);
                                  setShowOverflow(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm transition-colors ${
                                  isActive ? `${tab.color} bg-purple-50` : 'text-gray-700'
                                }`}
                              >
                                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                                <span>{tab.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll right button */}
          {showOverflow && canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              className="hidden md:flex items-center justify-center w-8 h-12 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Active tab indicator line (for mobile) */}
        <div className="md:hidden">
          <div
            className="h-0.5 bg-purple-500 transition-all duration-300"
            style={{
              width: `${100 / Math.min(visibleTabs.length + (overflowTabs.length > 0 ? 1 : 0), 4)}%`,
              transform: `translateX(${
                visibleTabs.findIndex(tab => tab.id === activeTab) * 
                (100 / Math.min(visibleTabs.length + (overflowTabs.length > 0 ? 1 : 0), 4))
              }%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}