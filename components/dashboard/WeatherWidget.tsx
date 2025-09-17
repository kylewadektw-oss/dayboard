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

'use client';

import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Thermometer,
  CloudLightning,
  CloudDrizzle,
  RefreshCw,
  AlertCircle,
  Wind,
  Droplets,
  Eye
} from 'lucide-react';
import { useEffect, useState, useCallback, memo } from 'react';
import { enhancedLogger, LogLevel } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/src/lib/types_db';

type Household = Database['public']['Tables']['households']['Row'];

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    visibility: number;
    wind_speed: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      night: number;
      min: number;
      max: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

interface WeatherWidgetProps {
  className?: string;
}

// Weather icon mapping based on OpenWeatherMap weather IDs
const getWeatherIcon = (weatherId: number, size: string = 'h-6 w-6') => {
  const baseClasses = `${size}`;

  if (weatherId >= 200 && weatherId < 300) {
    return <CloudLightning className={`${baseClasses} text-purple-500`} />;
  } else if (weatherId >= 300 && weatherId < 400) {
    return <CloudDrizzle className={`${baseClasses} text-blue-400`} />;
  } else if (weatherId >= 500 && weatherId < 600) {
    return <CloudRain className={`${baseClasses} text-blue-600`} />;
  } else if (weatherId >= 600 && weatherId < 700) {
    return <CloudSnow className={`${baseClasses} text-blue-200`} />;
  } else if (weatherId >= 700 && weatherId < 800) {
    return <Cloud className={`${baseClasses} text-gray-400`} />;
  } else if (weatherId === 800) {
    return <Sun className={`${baseClasses} text-yellow-500`} />;
  } else if (weatherId > 800) {
    return <Cloud className={`${baseClasses} text-gray-500`} />;
  }

  return <Sun className={`${baseClasses} text-yellow-500`} />;
};

function WeatherWidgetComponent({ className = '' }: WeatherWidgetProps) {
  const { user, profile, loading } = useAuth();
  const supabase = createClient();

  // Stable auth state management to prevent loading oscillation
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [stableAuthState, setStableAuthState] = useState({
    user: null as typeof user,
    profile: null as typeof profile,
    loading: true
  });

  // Update stable auth state when auth values change
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      setInitialLoadComplete(true);
      setStableAuthState({ user, profile, loading });
    } else if (initialLoadComplete) {
      setStableAuthState({ user, profile, loading });
    }
  }, [user, profile, loading, initialLoadComplete]);

  // Use stable state for all auth-dependent operations
  const currentProfile = stableAuthState.profile;
  const isAuthLoading = !initialLoadComplete || stableAuthState.loading;

  // Component state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [componentLoading, setComponentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  // Load household data and fetch weather - OPTIMIZED for better performance
  useEffect(() => {
    const loadHouseholdAndWeather = async () => {
      if (!currentProfile?.household_id) {
        setError('No household set in profile');
        setComponentLoading(false);
        return;
      }

      try {
        // Use cached fetch for household data if available
        const cacheKey = `household_${currentProfile.household_id}`;
        const householdData = sessionStorage.getItem(cacheKey);
        
        if (householdData) {
          // Use cached data for faster loading
          const parsed = JSON.parse(householdData);
          setHousehold(parsed);
          
          // Fetch weather immediately with cached coordinates
          if (parsed?.coordinates) {
            const coords = JSON.parse(parsed.coordinates as string) as {
              lat: number;
              lng: number;
            };
            
            // Start weather fetch immediately
            fetchWeatherData(coords, parsed);
          } else {
            setError('No location set in household profile');
            setComponentLoading(false);
          }
        } else {
          // Fetch household information and cache it
          const { data: householdResult, error: householdError } = await supabase
            .from('households')
            .select('*')
            .eq('id', currentProfile.household_id)
            .single();

          if (householdError) {
            console.error('Error fetching household:', householdError);
            setError('Failed to load household information');
            setComponentLoading(false);
            return;
          }

          setHousehold(householdResult);
          
          // Cache household data for 5 minutes
          sessionStorage.setItem(cacheKey, JSON.stringify(householdResult));
          setTimeout(() => sessionStorage.removeItem(cacheKey), 5 * 60 * 1000);

          // Fetch weather if coordinates are available
          if (householdResult?.coordinates) {
            const coords = JSON.parse(householdResult.coordinates as string) as {
              lat: number;
              lng: number;
            };
            
            fetchWeatherData(coords, householdResult);
          } else {
            setError('No location set in household profile');
            setComponentLoading(false);
          }
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load weather data';
        setError(errorMessage);

        await enhancedLogger.logWithFullContext(
          LogLevel.ERROR,
          'Failed to fetch household weather data',
          'WeatherWidget',
          {
            error: errorMessage,
            householdId: currentProfile?.household_id
          }
        );
        setComponentLoading(false);
      }
    };

    // Separate weather data fetching function for reuse
    const fetchWeatherData = async (coords: { lat: number; lng: number }, householdData: Database['public']['Tables']['households']['Row']) => {
      try {
        await enhancedLogger.logWithFullContext(
          LogLevel.INFO,
          'Fetching weather data for household location',
          'WeatherWidget',
          {
            householdName: householdData.name,
            lat: coords.lat,
            lng: coords.lng
          }
        );

        const res = await fetch(
          `/api/weather?lat=${coords.lat}&lon=${coords.lng}`
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || `HTTP ${res.status}: ${res.statusText}`
          );
        }

        const data = await res.json();
        setWeather(data);
        setLastUpdated(new Date());

        await enhancedLogger.logWithFullContext(
          LogLevel.INFO,
          'Weather data loaded successfully for household',
          'WeatherWidget',
          {
            householdName: householdData.name,
            currentTemp: data.current?.temp,
            condition: data.current?.weather?.[0]?.description
          }
        );
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load weather data';
        setError(errorMessage);

        await enhancedLogger.logWithFullContext(
          LogLevel.ERROR,
          'Failed to fetch weather data',
          'WeatherWidget',
          {
            error: errorMessage,
            householdName: householdData?.name
          }
        );
      } finally {
        setComponentLoading(false);
      }
    };

    loadHouseholdAndWeather();
  }, [currentProfile?.household_id, supabase]);

  // Trigger initial load when stable auth state is ready
  useEffect(() => {
    if (!isAuthLoading && currentProfile?.household_id) {
      // This will trigger the useEffect above through dependency change
    }
  }, [isAuthLoading, currentProfile?.household_id]);

  const fetchWeather = useCallback(async () => {
    if (!household?.coordinates) return;

    // Prevent requests more frequent than every 30 seconds
    const now = Date.now();
    if (now - lastRequestTime < 30000) {
      return;
    }
    setLastRequestTime(now);

    try {
      setComponentLoading(true);
      setError(null);

      const coords = JSON.parse(household.coordinates as string) as {
        lat: number;
        lng: number;
      };

      await enhancedLogger.logWithFullContext(
        LogLevel.INFO,
        'Refreshing weather data for household',
        'WeatherWidget',
        {
          householdName: household.name,
          lat: coords.lat,
          lng: coords.lng
        }
      );

      const res = await fetch(
        `/api/weather?lat=${coords.lat}&lon=${coords.lng}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `HTTP ${res.status}: ${res.statusText}`
        );
      }

      const data = await res.json();
      setWeather(data);
      setLastUpdated(new Date());

      await enhancedLogger.logWithFullContext(
        LogLevel.INFO,
        'Weather data refreshed successfully',
        'WeatherWidget',
        {
          householdName: household.name,
          currentTemp: data.current?.temp,
          condition: data.current?.weather?.[0]?.description
        }
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh weather data';
      setError(errorMessage);

      await enhancedLogger.logWithFullContext(
        LogLevel.ERROR,
        'Failed to refresh weather data',
        'WeatherWidget',
        {
          error: errorMessage,
          householdName: household?.name
        }
      );
    } finally {
      setComponentLoading(false);
    }
  }, [household?.coordinates, household?.name, lastRequestTime]);

  useEffect(() => {
    fetchWeather();

    // Only set up interval if there's no error
    // Refresh weather every 10 minutes, but with longer intervals if there are errors
    const interval = setInterval(
      () => {
        if (!error) {
          fetchWeather();
        }
      },
      error ? 30 * 60 * 1000 : 10 * 60 * 1000
    ); // 30 min if error, 10 min if no error

    return () => clearInterval(interval);
  }, [fetchWeather, error]);

  if ((isAuthLoading || componentLoading) && !weather) {
    return (
      <div
        className={`bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-3 bg-gray-200 rounded w-6 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-4 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isNoLocation =
      error.includes('No location') || error.includes('No household');

    return (
      <div
        className={`bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col justify-center ${className}`}
      >
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Weather Unavailable
          </h3>
          <p className="text-xs text-gray-600 mb-3">{error}</p>
          {isNoLocation ? (
            <a
              href="/profile"
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              📍 Set Address
            </a>
          ) : (
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const currentWeather = weather.current;
  const todayForecast = weather.daily[0];
  const upcomingDays = weather.daily.slice(1, 7); // Show 6 days

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-600 px-3 py-1 rounded-lg tracking-wide">
          TODAY&apos;S WEATHER
        </h3>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(currentWeather.temp)}°F
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {currentWeather.weather[0].description}
          </div>
          <div className="text-xs text-gray-500">
            Feels like {Math.round(currentWeather.feels_like)}°F
          </div>
        </div>
        {getWeatherIcon(currentWeather.weather[0].id, 'h-8 w-8')}
      </div>

      {/* Today's High/Low */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-red-500" />
          <span className="text-gray-600">
            H: {Math.round(todayForecast.temp.max)}°
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-blue-500" />
          <span className="text-gray-600">
            L: {Math.round(todayForecast.temp.min)}°
          </span>
        </div>
      </div>

      {/* 6-Day Forecast */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 mb-2">This Week</h4>
        <div className="grid grid-cols-6 gap-1">
          {upcomingDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(day.dt * 1000).toLocaleDateString('en-US', {
                  weekday: 'short'
                })}
              </div>
              {getWeatherIcon(day.weather[0].id, 'h-4 w-4 mx-auto mb-1')}
              <div className="text-xs font-medium text-gray-900">
                {Math.round(day.temp.day)}°
              </div>
              <div className="text-xs text-gray-500">
                {Math.round(day.temp.night)}°
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Weather Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Droplets className="w-3 h-3 text-blue-500" />
            </div>
            <div className="text-xs text-gray-500">Humidity</div>
            <div className="text-xs font-medium">
              {currentWeather.humidity}%
            </div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Wind className="w-3 h-3 text-green-500" />
            </div>
            <div className="text-xs text-gray-500">Wind</div>
            <div className="text-xs font-medium">
              {Math.round(currentWeather.wind_speed)} mph
            </div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Eye className="w-3 h-3 text-purple-500" />
            </div>
            <div className="text-xs text-gray-500">Visibility</div>
            <div className="text-xs font-medium">
              {Math.round((currentWeather.visibility || 10000) / 1609)} mi
            </div>
          </div>
        </div>

        {/* Location and Last Updated */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            📍 {household?.name || household?.city || 'Location'}
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
const WeatherWidget = memo(WeatherWidgetComponent);

// Default export for easier importing
export default WeatherWidget;

// Named export for specific imports
export { WeatherWidget };
