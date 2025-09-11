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

import { useState, useEffect, useRef } from 'react';
import { MapPin, Home, Navigation, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { loadGoogleMaps, GOOGLE_MAPS_LIBRARIES } from '@/utils/googleMaps';

interface Household {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface MapWidgetProps {
  className?: string;
}

declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
  }
}

export function HouseholdMapWidget({ className = '' }: MapWidgetProps) {
  const { profile } = useAuth();
  const supabase = createClient();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Fetch household data
  useEffect(() => {
    const fetchHousehold = async () => {
      if (!profile?.household_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('households')
          .select('id, name, address, city, state, zip')
          .eq('id', profile.household_id)
          .single();

        if (error) throw error;
        
        if (data) {
          setHousehold(data);
          // Geocode the address if we have one
          if (data.address && data.city && data.state) {
            geocodeAddress(data);
          }
        }
      } catch (err: any) {
        console.error('Error fetching household:', err);
        setError(err.message || 'Failed to load household information');
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [profile?.household_id, supabase]);

  // Load Google Maps script
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMaps([...GOOGLE_MAPS_LIBRARIES.GEOMETRY, 'marker']);
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setError('Failed to load Google Maps');
      }
    };

    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      initializeGoogleMaps();
    } else {
      setError('Google Maps API key not configured');
    }
  }, []);

  // Geocode address to get coordinates
  const geocodeAddress = async (householdData: Household) => {
    if (!window.google || !isMapLoaded) return;

    // Check if we have enough address data
    if (!householdData.address || !householdData.city || !householdData.state) {
      console.warn('Insufficient address data for geocoding');
      initializeFallbackMap();
      return;
    }

    const fullAddress = `${householdData.address}, ${householdData.city}, ${householdData.state}${householdData.zip ? ' ' + householdData.zip : ''}`;
    const geocoder = new window.google.maps.Geocoder();

    try {
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      const location = (results as any)[0].geometry.location;
      const coordinates = {
        lat: location.lat(),
        lng: location.lng()
      };

      setHousehold(prev => prev ? { ...prev, coordinates } : null);
      initializeMap(coordinates);
    } catch (err) {
      console.error('Geocoding error:', err);
      // Show a fallback map centered on the general area if possible
      initializeFallbackMap();
    }
  };

  // Initialize map with household location
  const initializeMap = (coordinates: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: 15,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapId: 'DEMO_MAP_ID' // Required for AdvancedMarkerElement
    });

    // Use AdvancedMarkerElement instead of deprecated Marker
    if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
      // Create a custom pin element
      const pinElement = new window.google.maps.marker.PinElement({
        background: '#10B981',
        borderColor: '#ffffff',
        glyphColor: '#ffffff',
        glyph: '🏠'
      });

      new window.google.maps.marker.AdvancedMarkerElement({
        position: coordinates,
        map: map,
        content: pinElement.element,
        title: household?.name || 'Home'
      });
    } else {
      // Fallback to regular marker if AdvancedMarkerElement is not available
      const homeIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 8
      };

      new window.google.maps.Marker({
        position: coordinates,
        map: map,
        icon: homeIcon,
        title: household?.name || 'Home'
      });
    }

    // Add a circle to show the general area
    new window.google.maps.Circle({
      strokeColor: '#10B981',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#10B981',
      fillOpacity: 0.1,
      map: map,
      center: coordinates,
      radius: 200 // 200 meters radius
    });

    mapInstanceRef.current = map;
  };

  // Fallback map for when geocoding fails
  const initializeFallbackMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default to center of US if no specific location
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 4,
      disableDefaultUI: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;
  };

  // Initialize map when both map library and household data are ready
  useEffect(() => {
    if (isMapLoaded && household?.coordinates) {
      initializeMap(household.coordinates);
    } else if (isMapLoaded && household && !household.coordinates) {
      geocodeAddress(household);
    }
  }, [isMapLoaded, household]);

  const formatAddress = (household: Household) => {
    const parts = [];
    if (household.address) parts.push(household.address);
    if (household.city) parts.push(household.city);
    if (household.state) parts.push(household.state);
    if (household.zip) parts.push(household.zip);
    return parts.join(', ');
  };

  const openInGoogleMaps = () => {
    if (!household) return;
    
    const address = formatAddress(household);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Household Location</h3>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error || !household) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Household Location</h3>
              <p className="text-sm text-red-600">{error || 'No household found'}</p>
            </div>
          </div>
        </div>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Home className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {!household ? 'Set up your household address in profile settings' : 'Unable to load map'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Home className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{household.name}</h3>
            <p className="text-sm text-gray-500">
              {formatAddress(household) || 'Address not set'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {household.coordinates && (
            <button
              onClick={openInGoogleMaps}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
              title="Open in Google Maps"
            >
              <Navigation className="h-4 w-4 text-blue-600" />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-48 w-full rounded-lg overflow-hidden bg-gray-100"
          style={{ minHeight: '192px' }}
        />
        {!isMapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {household.coordinates && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">
              Lat: {household.coordinates.lat.toFixed(4)}, 
              Lng: {household.coordinates.lng.toFixed(4)}
            </span>
          </div>
          <button
            onClick={openInGoogleMaps}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View in Maps →
          </button>
        </div>
      )}
    </div>
  );
}
