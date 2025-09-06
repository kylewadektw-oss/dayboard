'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function LandingPageLogger() {
  useEffect(() => {
    logger.info('🏡 User visited landing page', 'LandingPage', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      browserLanguage: navigator.language
    });

    // Track scroll events for engagement
    let maxScroll = 0;
    const trackScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        // Log significant scroll milestones
        if (scrollPercent >= 25 && scrollPercent < 50) {
          logger.info('📊 Landing page: 25% scroll depth reached', 'LandingPage');
        } else if (scrollPercent >= 50 && scrollPercent < 75) {
          logger.info('📊 Landing page: 50% scroll depth reached', 'LandingPage');
        } else if (scrollPercent >= 75) {
          logger.info('📊 Landing page: 75% scroll depth reached', 'LandingPage');
        }
      }
    };

    window.addEventListener('scroll', trackScroll);

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      logger.info('⏱️ Landing page: Time spent', 'LandingPage', { timeSpentSeconds: timeSpent });
    };

    // Log time spent when user leaves
    const handleBeforeUnload = () => {
      trackTimeOnPage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', trackScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      trackTimeOnPage(); // Final time tracking
    };
  }, []);

  return null;
}
