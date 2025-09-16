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


import { 
  Home, 
  Users, 
  Settings, 
  Sparkles, 
  Activity,
  Sun,
  CloudRain,
  Cloud,
  CloudSnow,
  CloudLightning,
  CloudDrizzle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/src/lib/types_db';

type Household = Database['public']['Tables']['households']['Row'];

interface HouseholdStats {
  projectsInProgress: number;
  mealsPlanned: number;
  activitiesScheduled: number;
  totalMembers: number;
  membersOnline: number;
}

interface HouseholdMember {
  id: string;
  name: string | null;
  preferred_name: string | null;
  family_role: string | null;
  last_seen_at: string | null;
  is_active: boolean | null;
  profile_photo_url: string | null;
}

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    uvi: number;
    sunrise: number;
    sunset: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily?: Array<{
    temp: {
      min: number;
      max: number;
    };
  }>;
}

const getWeatherIcon = (weatherId: number, size: string = "h-5 w-5") => {
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

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

// Component starts here

export function ProfileStatus() {
  const { user, profile } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [stats, setStats] = useState<HouseholdStats>({
    projectsInProgress: 0,
    mealsPlanned: 0,
    activitiesScheduled: 0,
    totalMembers: 0,
    membersOnline: 0
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  
  // Memoize display name calculation to avoid recomputation
  const displayName = useMemo(() => 
    profile?.preferred_name || profile?.name || user?.email?.split('@')[0] || 'there',
    [profile?.preferred_name, profile?.name, user?.email]
  );

  // Memoize greeting to avoid string concatenation on every render
  const greeting = useMemo(() => 
    `${getTimeBasedGreeting()}, ${displayName} 👋`,
    [displayName]
  );

  // Memoize household data loading function
  const loadHouseholdData = useCallback(async () => {
    console.log('🔍 [DEBUG] ProfileStatus - loadHouseholdData called with profile:', {
      hasProfile: !!profile,
      householdId: profile?.household_id,
      profileDisplayName: profile?.preferred_name || profile?.name
    });

    if (!profile?.household_id) {
      console.log('❌ [DEBUG] ProfileStatus - No household_id, stopping');
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
        console.error('Error loading household:', householdError);
      } else {
        setHousehold(householdData);
      }

      // Fetch household members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, name, preferred_name, family_role, last_seen_at, is_active, profile_photo_url')
        .eq('household_id', profile.household_id)
        .order('name');

      if (membersError) {
        console.error('Error loading household members:', membersError);
      } else {
        setHouseholdMembers(membersData || []);
      }

      // Calculate stats
      const totalMembers = membersData?.length || 0;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const membersOnline = membersData?.filter(member => 
        member.is_active && member.last_seen_at && member.last_seen_at > fiveMinutesAgo
      ).length || 0;

      // TODO: Fetch real project, meal, and activity data when those tables are implemented
      // For now, use placeholder data
      setStats({
        projectsInProgress: 2, // Will be replaced with real data
        mealsPlanned: 3, // Will be replaced with real data  
        activitiesScheduled: 1, // Will be replaced with real data
        totalMembers,
        membersOnline
      });

    } catch (error) {
      console.error('Error loading household data:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, supabase]);

  // Weather fetching function - Use household city/state for weather
  const fetchWeather = useCallback(async () => {
    if (!household?.city || !household?.state) {
      console.log('No household location available for weather');
      return;
    }
    
    setWeatherLoading(true);
    try {
      // Use city and state for weather lookup instead of coordinates
      const location = `${household.city}, ${household.state}`;
      console.log('Weather lookup for:', location);
      
      // For now, just log that weather would be fetched
      // TODO: Implement city-based weather API call
      setWeather(null);
      console.log('Weather fetched for household location:', household.name || 'Unknown location');
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setWeatherLoading(false);
    }
  }, [household?.city, household?.state, household?.name]);

  // Memoize members with computed properties to avoid recalculation
  const membersWithStatus = useMemo(() => 
    householdMembers.map(member => {
      const isOnline = member.is_active && member.last_seen_at && 
        new Date(member.last_seen_at) > new Date(Date.now() - 5 * 60 * 1000);
      const displayName = member.preferred_name || member.name || 'Unknown';
      const lastSeen = member.last_seen_at ? formatTimeAgo(member.last_seen_at) : 'Offline';
      const isCurrentUser = member.id === profile?.id;
      
      return {
        ...member,
        isOnline,
        displayName,
        lastSeen,
        isCurrentUser
      };
    }),
    [householdMembers, profile?.id]
  );

  useEffect(() => {
    loadHouseholdData();
  }, [loadHouseholdData]);

  // Fetch weather when household data is loaded
  useEffect(() => {
    if (household?.city && household?.state) {
      fetchWeather();
    }
  }, [household?.city, household?.state, fetchWeather]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
      <div className="flex items-start justify-between space-x-6">
        {/* Left Half - Greeting & Weather Info */}
        <div className="flex-1 max-w-[50%]">
          <div className="text-lg font-semibold text-gray-900 mb-1">
            {greeting}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <Home className="h-4 w-4 mr-1" />
            <span>{household?.name || 'Your Household'}</span>
            {stats.membersOnline > 0 && (
              <span className="ml-3 flex items-center text-green-600">
                <Activity className="h-3 w-3 mr-1" />
                {stats.membersOnline} online
              </span>
            )}
          </div>

          {/* Weather Info - Enhanced */}
          {weather ? (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(weather.current.weather[0].id, "h-8 w-8")}
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(weather.current.temp)}°F
                    </div>
                    <div className="text-sm text-gray-700 capitalize font-medium">
                      {weather.current.weather[0].description}
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600 space-y-1">
                  <div>Feels like <span className="font-medium">{Math.round(weather.current.feels_like)}°F</span></div>
                  <div>Humidity <span className="font-medium">{weather.current.humidity}%</span></div>
                  <div>Wind <span className="font-medium">{Math.round(weather.current.wind_speed)} mph</span></div>
                  <div>UV Index <span className="font-medium">{Math.round(weather.current.uvi)}</span></div>
                </div>
              </div>
              
              {/* Today's forecast */}
              {weather.daily && weather.daily[0] && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                  <div className="text-sm text-gray-600">
                    Today: <span className="font-medium">{Math.round(weather.daily[0].temp.max)}°/{Math.round(weather.daily[0].temp.min)}°</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sunrise: <span className="font-medium">{new Date(weather.current.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sunset: <span className="font-medium">{new Date(weather.current.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              )}
            </div>
          ) : weatherLoading ? (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <div className="w-20 h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Quick Profile Actions & Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* AI Assistant Button (Premium feature) */}
              <button 
                className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 rounded-lg transition-all duration-200 group"
                title="AI Assistant (Premium Feature)"
              >
                <Sparkles className="h-4 w-4 text-purple-600 group-hover:text-purple-700" />
              </button>

              {/* Household Members Quick View */}
              <Link 
                href="/household/members"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="View Household Members"
              >
                <Users className="h-4 w-4 text-gray-600" />
              </Link>

              {/* Settings */}
              <Link 
                href="/profile"
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Profile Settings"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </Link>
            </div>

            {/* Today's Stats - Inline */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>
                <span className="text-gray-700">
                  {stats.projectsInProgress} projects
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-1"></div>
                <span className="text-gray-700">
                  {stats.mealsPlanned} meals
                </span>
              </div>
              {stats.activitiesScheduled > 0 && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                  <span className="text-gray-700">
                    {stats.activitiesScheduled} activities
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Half - Member Tiles */}
        <div className="flex-1 max-w-[50%]">
          {/* Household Member Tiles */}
          {membersWithStatus.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-end items-start">
              {membersWithStatus.map((member) => {
                const initials = member.displayName
                  .split(' ')
                  .map(name => name.charAt(0).toUpperCase())
                  .join('')
                  .slice(0, 2);
                
                return (
                  <div
                    key={member.id}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div
                      className={`w-20 h-20 flex items-center justify-center transition-all duration-200 group cursor-pointer rounded-xl ${
                        member.isCurrentUser 
                          ? 'bg-blue-500 text-white ring-2 ring-blue-200 shadow-md' 
                          : member.isOnline
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm'
                      } group-hover:scale-105 relative`}
                      title={`${member.displayName} ${member.isCurrentUser ? '(You)' : ''} - ${member.isOnline ? 'Online' : member.lastSeen}`}
                    >
                      {/* Profile photo placeholder - will show initials if no photo */}
                      {member.profile_photo_url ? (
                        <Image 
                          src={member.profile_photo_url} 
                          alt={member.displayName}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold">{initials}</span>
                      )}
                      
                      {/* Online status indicator */}
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>
                    
                    {/* Member name */}
                    <span className="text-xs text-gray-600 text-center truncate max-w-[80px]">
                      {member.displayName.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export default memo(ProfileStatus);
