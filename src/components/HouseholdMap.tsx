'use client';

interface HouseholdMapProps {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export default function HouseholdMap({ address, city, state, zip }: HouseholdMapProps) {
  if (!address && !city) {
    return null;
  }

  const fullAddress = `${address || ''} ${city || ''} ${state || ''} ${zip || ''}`.trim();
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const hasGoogleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="mt-3">
      <div className="bg-gray-700 rounded-lg overflow-hidden max-w-md w-full">
        <div className="p-3 bg-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white text-sm font-medium">Location</span>
          </div>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
            title="Open in Google Maps"
          >
            Open in Maps ↗
          </a>
        </div>
        
        <div className="relative">
          {hasGoogleMapsKey ? (
            <iframe
              width="100%"
              height="150"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?key=${hasGoogleMapsKey}&q=${encodeURIComponent(fullAddress)}&zoom=15&maptype=roadmap`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
              title={`Map of ${fullAddress}`}
            />
          ) : (
            <div className="bg-gray-600 h-36 flex items-center justify-center flex-col space-y-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-1">Interactive Map</p>
                <p className="text-gray-400 text-xs mb-2">Add Google Maps API key to enable embedded maps</p>
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                >
                  <span>View on Google Maps</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
