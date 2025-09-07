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

/*
 * 📋 WEATHER WIDGET TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for weather widget data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/WeatherWidget';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * ```
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */


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

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { Cloud, Sun, CloudRain, CloudSnow, Thermometer } from 'lucide-react';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

// Mock weather data
const mockWeatherData: WeatherData = {
  current: {
    temp: 72,
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy'
  },
  forecast: [
    { day: 'Thu', high: 75, low: 58, condition: 'Sunny', icon: 'sunny' },
    { day: 'Fri', high: 68, low: 52, condition: 'Rainy', icon: 'rainy' },
    { day: 'Sat', high: 71, low: 55, condition: 'Cloudy', icon: 'cloudy' },
    { day: 'Sun', high: 74, low: 59, condition: 'Sunny', icon: 'sunny' },
    { day: 'Mon', high: 73, low: 57, condition: 'Partly Cloudy', icon: 'partly-cloudy' },
    { day: 'Tue', high: 69, low: 53, condition: 'Rainy', icon: 'rainy' }
  ]
};

const WeatherIcon = ({ condition, className = "" }: { condition: string; className?: string }) => {
  switch (condition) {
    case 'sunny':
      return <Sun className={`text-yellow-500 ${className}`} />;
    case 'rainy':
      return <CloudRain className={`text-blue-500 ${className}`} />;
    case 'cloudy':
      return <Cloud className={`text-gray-500 ${className}`} />;
    case 'snowy':
      return <CloudSnow className={`text-blue-300 ${className}`} />;
    default:
      return <Sun className={`text-yellow-400 ${className}`} />;
  }
};

export function WeatherWidget() {
  const weather = mockWeatherData;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Today's Weather</h3>
        <Thermometer className="h-4 w-4 text-gray-400" />
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">{weather.current.temp}°F</div>
          <div className="text-sm text-gray-600">{weather.current.condition}</div>
        </div>
        <WeatherIcon condition={weather.current.icon} className="h-8 w-8" />
      </div>

      {/* 6-Day Forecast */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-500 mb-2">This Week</h4>
        <div className="grid grid-cols-6 gap-1">
          {weather.forecast.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day.day}</div>
              <WeatherIcon condition={day.icon} className="h-4 w-4 mx-auto mb-1" />
              <div className="text-xs font-medium text-gray-900">{day.high}°</div>
              <div className="text-xs text-gray-500">{day.low}°</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">📍 Denver, CO</p>
      </div>
    </div>
  );
}
