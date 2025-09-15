'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, CloudRain, CloudSnow, Cloud, CloudDrizzle, Zap, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types_db';

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

function getWeatherIcon(weatherId: number, className = "h-4 w-4") {
  // Weather condition IDs from OpenWeatherMap
  if (weatherId >= 200 && weatherId < 300) return <Zap className={className} />; // Thunderstorm
  if (weatherId >= 300 && weatherId < 400) return <CloudDrizzle className={className} />; // Drizzle
  if (weatherId >= 500 && weatherId < 600) return <CloudRain className={className} />; // Rain
  if (weatherId >= 600 && weatherId < 700) return <CloudSnow className={className} />; // Snow
  if (weatherId >= 700 && weatherId < 800) return <Eye className={className} />; // Atmosphere (fog, etc.)
  if (weatherId === 800) return <Sun className={className} />; // Clear sky
  if (weatherId > 800) return <Cloud className={className} />; // Clouds
  return <Sun className={className} />; // Default
}

export default function SidebarWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchHouseholdAndWeather = async () => {
      if (!profile?.household_id) {
        console.log('No household_id available for weather');
        setLoading(false);
        return;
      }

      try {
        // Fetch household information
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', profile.household_id)
          .single();

        if (householdError) {
          console.error('Error fetching household:', householdError);
          setLoading(false);
          return;
        }

        setHousehold(householdData);

        // Fetch weather if coordinates are available  
        if (householdData?.coordinates) {
          console.log('Fetching weather for household:', householdData.name || 'Unknown');
          const coords = JSON.parse(householdData.coordinates as string) as { lat: number; lng: number };
          
          const response = await fetch(`/api/weather?lat=${coords.lat}&lng=${coords.lng}`);
          if (response.ok) {
            const data = await response.json();
            setWeather(data);
            console.log('Sidebar weather loaded for:', householdData.name || 'Household location');
          } else {
            console.error('Weather API request failed:', response.status, response.statusText);
          }
        } else {
          console.log('No coordinates set for household:', householdData.name || 'Unknown');
        }
      } catch (error) {
        console.error('Failed to fetch household or weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholdAndWeather();
  }, [profile?.household_id, supabase]);

  if (loading) {
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
            <Link href="/profile" className="hover:text-gray-400 transition-colors">
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
          : household?.name || 'Current Location'
        }
      </div>
      <div className="flex items-center space-x-2">
        {getWeatherIcon(weather.current.weather[0].id, "h-4 w-4 text-gray-300")}
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