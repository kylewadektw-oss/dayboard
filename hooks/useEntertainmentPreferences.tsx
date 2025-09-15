/**
 * Entertainment Preferences Hook
 * Manages user preferences and personalized recommendations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserPreferences {
  movies: {
    favoriteGenres: string[];
    preferredRatings: string[];
    streamingServices: string[];
    watchTime: 'short' | 'medium' | 'long';
  };
  music: {
    favoriteGenres: string[];
    preferredEra: string[];
    streamingServices: string[];
    discoveryMode: 'similar' | 'diverse' | 'trending';
  };
  events: {
    categories: string[];
    maxDistance: number;
    priceRange: [number, number];
    timePreferences: string[];
  };
  games: {
    categories: string[];
    playerCount: number[];
    complexity: 'simple' | 'medium' | 'complex';
    gameLength: 'quick' | 'medium' | 'long';
  };
}

const defaultPreferences: UserPreferences = {
  movies: {
    favoriteGenres: ['Action', 'Comedy', 'Drama'],
    preferredRatings: ['PG-13', 'R'],
    streamingServices: ['Netflix', 'Hulu', 'Prime Video'],
    watchTime: 'medium'
  },
  music: {
    favoriteGenres: ['Pop', 'Rock', 'Alternative'],
    preferredEra: ['2000s', '2010s', '2020s'],
    streamingServices: ['Spotify', 'Apple Music'],
    discoveryMode: 'similar'
  },
  events: {
    categories: ['Music', 'Food & Drink', 'Arts'],
    maxDistance: 25,
    priceRange: [0, 100],
    timePreferences: ['Evening', 'Weekend']
  },
  games: {
    categories: ['Strategy', 'Party', 'Cooperative'],
    playerCount: [2, 3, 4],
    complexity: 'medium',
    gameLength: 'medium'
  }
};

export function useEntertainmentPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('entertainment-preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    try {
      localStorage.setItem('entertainment-preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, []);

  // Update specific category preferences
  const updateMoviePreferences = useCallback((updates: Partial<UserPreferences['movies']>) => {
    savePreferences({
      ...preferences,
      movies: { ...preferences.movies, ...updates }
    });
  }, [preferences, savePreferences]);

  const updateMusicPreferences = useCallback((updates: Partial<UserPreferences['music']>) => {
    savePreferences({
      ...preferences,
      music: { ...preferences.music, ...updates }
    });
  }, [preferences, savePreferences]);

  const updateEventPreferences = useCallback((updates: Partial<UserPreferences['events']>) => {
    savePreferences({
      ...preferences,
      events: { ...preferences.events, ...updates }
    });
  }, [preferences, savePreferences]);

  const updateGamePreferences = useCallback((updates: Partial<UserPreferences['games']>) => {
    savePreferences({
      ...preferences,
      games: { ...preferences.games, ...updates }
    });
  }, [preferences, savePreferences]);

  // Generate personalized recommendations based on preferences
  const getPersonalizedRecommendations = useCallback((category: keyof UserPreferences) => {    
    switch (category) {
      case 'movies':
        return {
          genres: preferences.movies.favoriteGenres,
          suggestedContent: [
            'Movies trending in your favorite genres',
            'New releases on your streaming services',
            'Critics picks matching your ratings preference'
          ]
        };
      
      case 'music':
        return {
          genres: preferences.music.favoriteGenres,
          suggestedContent: [
            'Artists similar to your favorites',
            'New releases in preferred genres',
            'Trending songs from your preferred era'
          ]
        };
      
      case 'events':
        return {
          categories: preferences.events.categories,
          suggestedContent: [
            `Events within ${preferences.events.maxDistance} miles`,
            'Events in your favorite categories',
            'Events matching your time preferences'
          ]
        };
      
      case 'games':
        return {
          categories: preferences.games.categories,
          suggestedContent: [
            `Games for ${Math.min(...preferences.games.playerCount)}-${Math.max(...preferences.games.playerCount)} players`,
            'Games matching your complexity preference',
            'New releases in your favorite categories'
          ]
        };
      
      default:
        return { genres: [], suggestedContent: [] };
    }
  }, [preferences]);

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    savePreferences(defaultPreferences);
  }, [savePreferences]);

  return {
    preferences,
    isLoading,
    updateMoviePreferences,
    updateMusicPreferences,
    updateEventPreferences,
    updateGamePreferences,
    getPersonalizedRecommendations,
    resetPreferences,
    savePreferences
  };
}