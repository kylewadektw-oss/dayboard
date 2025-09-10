/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Google Maps API Duplicate Loading Test
 */

'use client';

import { useState } from 'react';
import { GoogleAddressInput } from '@/components/ui/GoogleAddressInput';
import { HouseholdMapWidget } from '@/components/dashboard/HouseholdMapWidget';

interface AddressData {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export default function GoogleMapsTest() {
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Google Maps API Integration Test
        </h1>
        <p className="text-gray-600">
          Testing both GoogleAddressInput and HouseholdMapWidget on the same page.
          Check browser console - there should be NO "multiple API includes" errors.
        </p>
      </div>

      {/* Address Input Component */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Address Input (Places API)
        </h2>
        <GoogleAddressInput
          onAddressSelect={(data) => {
            setAddressData(data);
            console.log('✅ Address selected:', data);
          }}
          placeholder="Enter an address to test Places API..."
          className="w-full"
        />
        {addressData && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Address captured successfully!
            </p>
            <pre className="text-xs text-green-700 mt-2">
              {JSON.stringify(addressData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Map Widget Component */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Household Map (Maps API)
        </h2>
        <HouseholdMapWidget className="h-64" />
      </div>

      {/* Console Check Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          🧪 Test Instructions:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Open browser Developer Tools (F12)</li>
          <li>2. Go to the Console tab</li>
          <li>3. Look for Google Maps loading messages</li>
          <li>4. Verify NO "You have included the Google Maps JavaScript API multiple times" errors</li>
          <li>5. Both components should work without API conflicts</li>
        </ul>
      </div>
    </div>
  );
}
