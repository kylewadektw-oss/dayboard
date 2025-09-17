'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  CloudRain,
  CloudSnow,
  Cloud,
  CloudDrizzle,
  Zap,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/src/lib/types_db';

type Household = Database['public']['Tables']['households']['Row'];

interface WeatherData {
  current: {
    temp: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
}

function getWeatherIcon(weatherId: number, className = 'h-4 w-4') {
  // Weather condition IDs from OpenWeatherMap
  if (weatherId >= 200 && weatherId < 300) return <Zap className={className} />; // Thunderstorm
  if (weatherId >= 300 && weatherId < 400)
    return <CloudDrizzle className={className} />; // Drizzle
  if (weatherId >= 500 && weatherId < 600)
    return <CloudRain className={className} />; // Rain
  if (weatherId >= 600 && weatherId < 700)
    return <CloudSnow className={className} />; // Snow
  if (weatherId >= 700 && weatherId < 800) return <Eye className={className} />; // Atmosphere (fog, etc.)
  if (weatherId === 800) return <Sun className={className} />; // Clear sky
  if (weatherId > 800) return <Cloud className={className} />; // Clouds
  return <Sun className={className} />; // Default
}

export default function SidebarWeather() {
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

  useEffect(() => {
    const fetchHouseholdAndWeather = async () => {
      if (!currentProfile?.household_id) {
        console.log('No household_id available for weather');
        setComponentLoading(false);
        return;
      }

      // Check cache first to reduce API calls
      const cacheKey = `weather_${currentProfile.household_id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if less than 15 minutes old (reduced from frequent refreshes)
          if (Date.now() - timestamp < 15 * 60 * 1000) {
            setWeather(data.weather);
            setHousehold(data.household);
            setComponentLoading(false);
            console.log('Using cached weather data');
            return;
          }
        } catch {
          // Invalid cache, continue with fresh fetch
        }
      }

      try {
        // Fetch household information
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', currentProfile.household_id)
          .single();

        if (householdError) {
          console.error('Error fetching household:', householdError);
          setComponentLoading(false);
          return;
        }

        setHousehold(householdData);

        // Fetch weather if coordinates are available
        if (householdData?.coordinates) {
          console.log(
            'Fetching fresh weather for household:',
            householdData.name || 'Unknown'
          );
          const coords = JSON.parse(householdData.coordinates as string) as {
            lat: number;
            lng: number;
          };

          const response = await fetch(
            `/api/weather?lat=${coords.lat}&lon=${coords.lng}`
          );
          if (response.ok) {
            const weatherData = await response.json();
            setWeather(weatherData);
            
            // Cache the result for 15 minutes
            sessionStorage.setItem(cacheKey, JSON.stringify({
              data: { weather: weatherData, household: householdData },
              timestamp: Date.now()
            }));
            
            console.log(
              'Fresh weather loaded and cached for:',
              householdData.name || 'Household location'
            );
          } else {
            console.error(
              'Weather API request failed:',
              response.status,
              response.statusText
            );
          }
        } else {
          console.log(
            'No coordinates set for household:',
            householdData.name || 'Unknown'
          );
        }
      } catch (error) {
        console.error('Failed to fetch household or weather:', error);
      } finally {
        setComponentLoading(false);
      }
    };

    fetchHouseholdAndWeather();
  }, [currentProfile?.household_id, supabase]);

  // Trigger initial load when stable auth state is ready
  useEffect(() => {
    if (!isAuthLoading && currentProfile?.household_id) {
      // This will trigger the useEffect above through dependency change
    }
  }, [isAuthLoading, currentProfile?.household_id]);

  if (isAuthLoading || componentLoading) {
    return (
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/30">
        <div className="text-xs text-gray-400 mb-1">Weather</div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/30">
        <div className="text-xs text-gray-400 mb-1">Weather</div>
        <div className="text-sm text-gray-500">
          {household ? (
            <Link
              href="/profile"
              className="hover:text-gray-400 transition-colors"
            >
              📍 Set household address →
            </Link>
          ) : (
            'Loading household...'
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/30">
      <div className="text-xs text-gray-400 mb-1">
        {household?.city && household?.state
          ? `${household.city}, ${household.state}`
          : household?.name || 'Current Location'}
      </div>
      <div className="flex items-center space-x-2">
        {getWeatherIcon(weather.current.weather[0].id, 'h-4 w-4 text-gray-300')}
        <span className="text-sm text-white font-medium">
          {Math.round(weather.current.temp)}°F
        </span>
        <span className="text-xs text-gray-400 capitalize">
          {weather.current.weather[0].description}
        </span>
      </div>
    </div>
  );
}
