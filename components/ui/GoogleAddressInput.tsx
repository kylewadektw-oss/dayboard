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

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleAddressInput({
  onAddressSelect,
  initialValue = '',
  placeholder = 'Enter your address',
  className = '',
  disabled = false
}: GoogleAddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Places API
  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        setError('Failed to load Google Places API');
      };
      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  // Initialize autocomplete when Google Places is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current || disabled) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        fields: ['address_components', 'formatted_address', 'geometry']
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
    } catch (err) {
      console.error('Error initializing Google Places Autocomplete:', err);
      setError('Failed to initialize address autocomplete');
    }
  }, [isLoaded, disabled, onAddressSelect]);

  // Parse Google Places API response into structured address data
  const parseAddressComponents = (place: any): AddressData => {
    const components = place.address_components || [];
    const addressData: AddressData = {
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      formattedAddress: place.formatted_address || '',
      coordinates: place.geometry?.location ? {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
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
          placeholder={isLoaded ? placeholder : 'Loading address search...'}
          disabled={disabled || !isLoaded}
          className={`
            w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {!isLoaded && !error && (
        <p className="mt-1 text-sm text-gray-500">
          Loading Google Places API...
        </p>
      )}
      
      {isLoaded && !error && (
        <p className="mt-1 text-sm text-gray-500">
          Start typing to search for addresses
        </p>
      )}
    </div>
  );
}
