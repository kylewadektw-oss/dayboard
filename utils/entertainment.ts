/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Entertainment Utilities - Shared functions and types for entertainment features
 */

'use client';

// ===============================
// TYPES & INTERFACES
// ===============================

export type EntertainmentCategory = 'movies' | 'music' | 'events' | 'games' | 'activities';

export interface BaseEntertainmentItem {
  id: string | number;
  title: string;
  category: EntertainmentCategory;
  description?: string;
  rating?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Movie extends BaseEntertainmentItem {
  category: 'movies';
  genre: string;
  duration: string;
  releaseDate?: string;
  director?: string;
  cast?: string[];
  poster?: string;
  streamingServices?: string[];
  theaters?: TheaterShowtime[];
}

export interface MusicItem extends BaseEntertainmentItem {
  category: 'music';
  artist: string;
  album?: string;
  genre: string;
  duration: string;
  streamingLinks?: StreamingLinks;
  isExplicit?: boolean;
}

export interface LocalEvent extends BaseEntertainmentItem {
  category: 'events';
  date: string;
  time: string;
  location: string;
  address?: string;
  distance?: string;
  price: string;
  organizer?: string;
  attendeeCount?: number;
  eventType: 'festival' | 'concert' | 'workshop' | 'market' | 'sports' | 'family' | 'other';
}

export interface Game extends BaseEntertainmentItem {
  category: 'games';
  gameType: 'board' | 'digital' | 'activity' | 'party';
  players: string;
  duration: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  ageRange?: string;
  platform?: string;
  owned?: boolean;
  lastPlayed?: string;
}

export interface TheaterShowtime {
  theater: string;
  address?: string;
  distance?: string;
  showtimes: string[];
  ticketUrl?: string;
}

export interface StreamingLinks {
  spotify?: string;
  apple?: string;
  youtube?: string;
  amazon?: string;
  [key: string]: string | undefined;
}

export interface Playlist {
  id: string;
  name: string;
  creator: string;
  songs: MusicItem[];
  songCount: number;
  duration: string;
  genre: string;
  emoji?: string;
  isPublic: boolean;
  lastUpdated: string;
}

export interface GameNight {
  id: string;
  date: string;
  theme: string;
  games: string[];
  attendees: string[];
  snacks?: string;
  location?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UserPreferences {
  favoriteGenres: {
    movies: string[];
    music: string[];
    events: string[];
    games: string[];
    activities: string[];
  };
  streamingServices: string[];
  maxDistance: number; // for events in miles
  priceRange: {
    min: number;
    max: number;
  };
  notifications: {
    newReleases: boolean;
    localEvents: boolean;
    gameNights: boolean;
    concerts: boolean;
  };
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Format duration from minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Calculate distance between two coordinates (approximate)
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Format rating for display
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get age-appropriate content filter
 */
export function isAgeAppropriate(
  content: BaseEntertainmentItem, 
  userAge: number
): boolean {
  // Basic age filtering logic - would be expanded based on content ratings
  if ('isExplicit' in content && content.isExplicit && userAge < 18) {
    return false;
  }
  return true;
}

/**
 * Generate color for category
 */
export function getCategoryColor(category: EntertainmentCategory): {
  bg: string;
  text: string;
  border: string;
} {
  const colors = {
    movies: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    music: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200'
    },
    events: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    games: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200'
    },
    activities: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200'
    }
  };
  
  return colors[category];
}

/**
 * Search and filter entertainment items
 */
export function searchEntertainment<T extends BaseEntertainmentItem>(
  items: T[],
  query: string,
  filters?: {
    category?: EntertainmentCategory;
    minRating?: number;
    tags?: string[];
  }
): T[] {
  let filtered = items;

  // Apply text search
  if (query.trim()) {
    const searchQuery = query.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchQuery) ||
      item.description?.toLowerCase().includes(searchQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  // Apply filters
  if (filters) {
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.minRating) {
      filtered = filtered.filter(item => 
        item.rating ? item.rating >= filters.minRating! : false
      );
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        item.tags?.some(tag => filters.tags!.includes(tag))
      );
    }
  }

  return filtered;
}

/**
 * Sort entertainment items by various criteria
 */
export function sortEntertainment<T extends BaseEntertainmentItem>(
  items: T[],
  sortBy: 'title' | 'rating' | 'date' | 'popularity'
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'date':
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return bDate.getTime() - aDate.getTime();
      case 'popularity':
        // Would integrate with real popularity metrics
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
}

/**
 * Get recommendations based on user preferences
 */
export function getRecommendations<T extends BaseEntertainmentItem>(
  items: T[],
  userPreferences: Partial<UserPreferences>,
  category: EntertainmentCategory,
  limit: number = 10
): T[] {
  let filtered = items.filter(item => item.category === category);

  // Filter by preferred genres if available
  if (userPreferences.favoriteGenres?.[category]) {
    const preferredGenres = userPreferences.favoriteGenres[category];
    filtered = filtered.filter(item => {
      if ('genre' in item) {
        return preferredGenres.some(genre => 
          (item.genre as string).toLowerCase().includes(genre.toLowerCase())
        );
      }
      return true;
    });
  }

  // Sort by rating and return top items
  return sortEntertainment(filtered, 'rating').slice(0, limit);
}

/**
 * Generate emoji for category
 */
export function getCategoryEmoji(category: EntertainmentCategory): string {
  const emojis = {
    movies: '🎬',
    music: '🎵',
    events: '📅',
    games: '🎲',
    activities: '⚡'
  };
  
  return emojis[category];
}

/**
 * Validate entertainment item data
 */
export function validateEntertainmentItem(item: Partial<BaseEntertainmentItem>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!item.title?.trim()) {
    errors.push('Title is required');
  }

  if (!item.category) {
    errors.push('Category is required');
  }

  if (item.rating && (item.rating < 0 || item.rating > 10)) {
    errors.push('Rating must be between 0 and 10');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate shareable entertainment content
 */
export function generateShareableContent(item: BaseEntertainmentItem): {
  title: string;
  description: string;
  url?: string;
} {
  const emoji = getCategoryEmoji(item.category);
  
  return {
    title: `${emoji} ${item.title}`,
    description: item.description || `Check out this ${item.category} recommendation!`,
    url: window.location.href
  };
}

// ===============================
// API INTEGRATION HELPERS
// ===============================

/**
 * API endpoint configurations for external services
 */
export const API_ENDPOINTS = {
  // Movie APIs
  TMDB_BASE: 'https://api.themoviedb.org/3',
  FANDANGO_BASE: 'https://api.fandango.com/v1',
  
  // Music APIs  
  SPOTIFY_BASE: 'https://api.spotify.com/v1',
  LASTFM_BASE: 'https://ws.audioscrobbler.com/2.0',
  SONGKICK_BASE: 'https://api.songkick.com/api/3.0',
  
  // Events APIs
  EVENTBRITE_BASE: 'https://www.eventbriteapi.com/v3',
  MEETUP_BASE: 'https://api.meetup.com',
  TICKETMASTER_BASE: 'https://app.ticketmaster.com/discovery/v2',
  
  // Games APIs
  BOARDGAMEGEEK_BASE: 'https://boardgamegeek.com/xmlapi2',
  RAWG_BASE: 'https://api.rawg.io/api'
} as const;

/**
 * Mock data generators for development
 */
export const MockDataGenerators = {
  generateMovies: (count: number): Movie[] => {
    const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'];
    const movies: Movie[] = [];
    
    for (let i = 0; i < count; i++) {
      movies.push({
        id: i + 1,
        title: `Movie ${i + 1}`,
        category: 'movies',
        genre: genres[Math.floor(Math.random() * genres.length)],
        duration: `${90 + Math.floor(Math.random() * 60)}m`,
        rating: 3 + Math.random() * 4,
        description: `A great ${genres[Math.floor(Math.random() * genres.length)].toLowerCase()} movie.`,
        tags: ['Popular', 'New Release']
      });
    }
    
    return movies;
  },

  generateEvents: (count: number): LocalEvent[] => {
    const eventTypes = ['festival', 'concert', 'workshop', 'market', 'sports', 'family'] as const;
    const events: LocalEvent[] = [];
    
    for (let i = 0; i < count; i++) {
      events.push({
        id: i + 1,
        title: `Event ${i + 1}`,
        category: 'events',
        date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: `${Math.floor(Math.random() * 12) + 1}:00 PM`,
        location: `Venue ${i + 1}`,
        price: Math.random() > 0.5 ? 'Free' : `$${Math.floor(Math.random() * 50) + 10}`,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        description: `An exciting ${eventTypes[Math.floor(Math.random() * eventTypes.length)]} event.`,
        tags: ['Local', 'Popular']
      });
    }
    
    return events;
  }
};

export default {
  formatDuration,
  calculateDistance,
  formatRating,
  isAgeAppropriate,
  getCategoryColor,
  searchEntertainment,
  sortEntertainment,
  getRecommendations,
  getCategoryEmoji,
  validateEntertainmentItem,
  generateShareableContent,
  API_ENDPOINTS,
  MockDataGenerators
};