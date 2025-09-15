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
import { MapPin, Search, AlertCircle } from 'lucide-react';
import { loadGoogleMaps, GOOGLE_MAPS_LIBRARIES } from '@/utils/googleMaps';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  formattedAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface GoogleAddressInputProps {
  onAddressSelect: (address: AddressData) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}


export function GoogleAddressInput({
  onAddressSelect,
  initialValue = '',
  placeholder = 'Enter your address',
  className = '',
  disabled = false
}: GoogleAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<unknown>(null);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Places API
  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        // Check if Google Maps API key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.log('Google Maps API key not configured, using fallback address input');
          setError('Google Maps API not configured for address autocomplete');
          return;
        }

        await loadGoogleMaps([...GOOGLE_MAPS_LIBRARIES.PLACES]);
        setIsLoaded(true);
      } catch (error) {
        console.log('Failed to load Google Places API:', error);
        setError('Address autocomplete not available');
      }
    };

    initializeGooglePlaces();
  }, []);

  // Initialize autocomplete when Google Places is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current || disabled) return;

    try {
      // Double-check that Google API is actually available
      if (!window.google?.maps?.places?.Autocomplete) {
        console.log('Google Places API not fully loaded, skipping autocomplete initialization');
        setError('Address autocomplete not available');
        return;
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      // Ensure dropdown suggestions are fully visible
      autocomplete.setOptions({
        bounds: undefined, // Don't restrict to viewport bounds
        strictBounds: false, // Allow suggestions outside bounds
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components) {
          setError('Please select a valid address from the dropdown');
          return;
        }

        const addressData = parseAddressComponents(place);
        setInputValue(addressData.formattedAddress);
        onAddressSelect(addressData);
        setError(null);
      });

      autocompleteRef.current = autocomplete;
      
      // Clear any previous errors when autocomplete is successfully initialized
      setError(null);
    } catch (err) {
      console.log('Error initializing Google Places Autocomplete:', err);
      setError('Address autocomplete not available');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, disabled, onAddressSelect]);

type GooglePlaceGeometry = {
  location: {
    lat(): number;
    lng(): number;
  }
};

// Parse Google Places API response into structured address data
  const parseAddressComponents = (place: unknown): AddressData => {
    const placeObj = place as { 
      address_components?: Array<{ 
        long_name: string; 
        short_name: string; 
        types: string[] 
      }>; 
      formatted_address?: string;
      geometry?: GooglePlaceGeometry;
    };
    const components = placeObj.address_components || [];
    const addressData: AddressData = {
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      formattedAddress: placeObj.formatted_address || '',
      coordinates: placeObj.geometry?.location ? {
        lat: placeObj.geometry.location.lat(),
        lng: placeObj.geometry.location.lng()
      } : undefined
    };

    let streetNumber = '';
    let streetName = '';

    components.forEach((component: AddressComponent) => {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        streetName = component.long_name;
      } else if (types.includes('locality')) {
        addressData.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        addressData.state = component.short_name;
      } else if (types.includes('postal_code')) {
        addressData.zip = component.long_name;
      } else if (types.includes('country')) {
        addressData.country = component.short_name;
      }
    });

    // Combine street number and name
    addressData.address = [streetNumber, streetName].filter(Boolean).join(' ');

    return addressData;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Google Places API isn't available, allow Enter key to submit the manually typed address
    if (e.key === 'Enter' && !isLoaded) {
      e.preventDefault();
      const manualAddress: AddressData = {
        address: inputValue,
        city: '',
        state: '',
        zip: '',
        country: 'US',
        formattedAddress: inputValue
      };
      onAddressSelect(manualAddress);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoaded ? (
            <MapPin className="h-5 w-5 text-gray-400" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 animate-pulse" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isLoaded ? placeholder : error ? 'Enter address manually' : 'Loading address search...'}
          disabled={disabled}
          className={`
            w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500' : ''}
            ${className}
          `}
          style={{
            position: 'relative',
            zIndex: 1
          }}
        />
        {error && !error.includes('not configured') && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
        )}
      </div>
      
      {error && error.includes('not configured') && (
        <p className="mt-1 text-sm text-yellow-600">
          Address autocomplete not available. Type your address and press Enter.
        </p>
      )}
      
      {error && !error.includes('not configured') && (
        <p className="mt-1 text-sm text-yellow-600">{error}</p>
      )}
      
      {!isLoaded && !error && (
        <p className="mt-1 text-sm text-gray-500">
          Loading address autocomplete...
        </p>
      )}
      
      {isLoaded && !error && (
        <p className="mt-1 text-sm text-green-600">
          ✓ Address search ready - start typing to see suggestions
        </p>
      )}
      
      <style jsx>{`
        /* Ensure Google Places dropdown appears above other elements */
        :global(.pac-container) {
          z-index: 9999 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          margin-top: 4px !important;
        }
        
        :global(.pac-item) {
          padding: 8px 12px !important;
          border-bottom: 1px solid #f3f4f6 !important;
          font-size: 14px !important;
          cursor: pointer !important;
        }
        
        :global(.pac-item:hover) {
          background-color: #f3f4f6 !important;
        }
        
        :global(.pac-item-selected) {
          background-color: #dbeafe !important;
        }
        
        :global(.pac-matched) {
          font-weight: 600 !important;
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  );
}
