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

import { NextResponse } from 'next/server';
import { enhancedLogger, LogLevel } from '@/utils/logger';

export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // Note: OpenMeteo doesn't require an API key - it's completely free!

    // Validate required parameters
    if (!lat || !lon) {
      await enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'Weather API called without lat/lon coordinates',
        'WeatherAPI',
        {
          lat,
          lon,
          url: req.url
        }
      );

      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinate format
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      await enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'Invalid coordinates provided to weather API',
        'WeatherAPI',
        {
          lat: parseFloat(latitude.toString()),
          lon: parseFloat(longitude.toString())
        }
      );

      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    await enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'Fetching weather data from OpenMeteo',
      'WeatherAPI',
      {
        lat: parseFloat(latitude.toString()),
        lon: parseFloat(longitude.toString()),
        provider: 'OpenMeteo'
      }
    );

    // Fetch weather data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // OpenMeteo API - free, no API key required, includes 7-day forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`;

    const res = await fetch(weatherUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Dayboard/1.0 Household Dashboard'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      await enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'OpenMeteo API error - falling back to mock data',
        'WeatherAPI',
        {
          status: res.status,
          statusText: res.statusText,
          errorMessage: errorText.substring(0, 200),
          lat: parseFloat(latitude.toString()),
          lon: parseFloat(longitude.toString()),
          url: weatherUrl
        }
      );

      // Return enhanced mock weather data when external API fails
      const mockWeatherData = {
        current: {
          temp: 72,
          feels_like: 75,
          humidity: 60,
          visibility: 10000,
          wind_speed: 5,
          weather: [
            {
              id: 800,
              main: 'Clear',
              description: 'clear sky',
              icon: '01d'
            }
          ]
        },
        daily: Array.from({ length: 7 }, (_, i) => ({
          dt: Math.floor(Date.now() / 1000) + i * 24 * 60 * 60,
          temp: {
            day: 70 + Math.floor(Math.random() * 20),
            night: 55 + Math.floor(Math.random() * 15),
            min: 55 + Math.floor(Math.random() * 15),
            max: 70 + Math.floor(Math.random() * 20)
          },
          weather: [
            {
              id: i % 3 === 0 ? 500 : i % 2 === 0 ? 801 : 800,
              main: i % 3 === 0 ? 'Rain' : i % 2 === 0 ? 'Clouds' : 'Clear',
              description:
                i % 3 === 0
                  ? 'light rain'
                  : i % 2 === 0
                    ? 'few clouds'
                    : 'clear sky',
              icon: i % 3 === 0 ? '10d' : i % 2 === 0 ? '02d' : '01d'
            }
          ]
        }))
      };

      const response = NextResponse.json(mockWeatherData);
      response.headers.set('X-Mock-Data', 'true');
      response.headers.set('X-Fallback-Reason', 'External API Error');
      response.headers.set('Cache-Control', 'public, max-age=60'); // Cache mock data for 1 minute
      return response;
    }

    const data = await res.json();

    // Transform OpenMeteo response to match expected format
    if (!data.current || !data.daily) {
      await enhancedLogger.logWithFullContext(
        LogLevel.ERROR,
        'Invalid OpenMeteo API response structure',
        'WeatherAPI',
        {
          hasCurrent: !!data.current,
          hasDaily: !!data.daily,
          responseKeys: Object.keys(data)
        }
      );

      return NextResponse.json(
        { error: 'Invalid weather data received' },
        { status: 502 }
      );
    }

    // Helper function to map weather codes to descriptions
    const getWeatherDescription = (code: number) => {
      const weatherCodes: Record<number, { main: string; description: string; icon: string }> = {
        0: { main: 'Clear', description: 'clear sky', icon: '01d' },
        1: { main: 'Clear', description: 'mainly clear', icon: '01d' },
        2: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
        3: { main: 'Clouds', description: 'overcast', icon: '03d' },
        45: { main: 'Fog', description: 'fog', icon: '50d' },
        48: { main: 'Fog', description: 'depositing rime fog', icon: '50d' },
        51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
        53: { main: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
        55: { main: 'Drizzle', description: 'dense drizzle', icon: '09d' },
        61: { main: 'Rain', description: 'slight rain', icon: '10d' },
        63: { main: 'Rain', description: 'moderate rain', icon: '10d' },
        65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
        80: { main: 'Rain', description: 'slight rain showers', icon: '09d' },
        81: { main: 'Rain', description: 'moderate rain showers', icon: '09d' },
        82: { main: 'Rain', description: 'violent rain showers', icon: '09d' },
        71: { main: 'Snow', description: 'slight snow', icon: '13d' },
        73: { main: 'Snow', description: 'moderate snow', icon: '13d' },
        75: { main: 'Snow', description: 'heavy snow', icon: '13d' },
        95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
        96: { main: 'Thunderstorm', description: 'thunderstorm with hail', icon: '11d' },
        99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' }
      };
      return weatherCodes[code] || { main: 'Unknown', description: 'unknown', icon: '01d' };
    };

    // Transform to expected format
    const currentWeather = getWeatherDescription(data.current.weather_code);
    const transformedData = {
      current: {
        temp: Math.round(data.current.temperature_2m),
        feels_like: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        visibility: data.current.visibility || 10000,
        wind_speed: data.current.wind_speed_10m,
        weather: [
          {
            id: data.current.weather_code,
            main: currentWeather.main,
            description: currentWeather.description,
            icon: currentWeather.icon
          }
        ]
      },
      daily: data.daily.time.map((date: string, index: number) => {
        const dailyWeather = getWeatherDescription(data.daily.weather_code[index]);
        return {
          dt: Math.floor(new Date(date).getTime() / 1000),
          temp: {
            day: Math.round(data.daily.temperature_2m_max[index]),
            night: Math.round(data.daily.temperature_2m_min[index]),
            min: Math.round(data.daily.temperature_2m_min[index]),
            max: Math.round(data.daily.temperature_2m_max[index])
          },
          weather: [
            {
              id: data.daily.weather_code[index],
              main: dailyWeather.main,
              description: dailyWeather.description,
              icon: dailyWeather.icon
            }
          ]
        };
      })
    };

    const responseTime = Date.now() - startTime;
    await enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'Weather data fetched successfully from OpenMeteo',
      'WeatherAPI',
      {
        lat: latitude,
        lon: longitude,
        responseTime: `${responseTime}ms`,
        currentTemp: transformedData.current.temp,
        forecastDays: transformedData.daily.length,
        provider: 'OpenMeteo'
      }
    );

    // Add cache headers (5 minute cache)
    const response = NextResponse.json(transformedData);
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('X-Weather-Provider', 'OpenMeteo');

    return response;
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error('Unknown error');

    // Create serialization-safe error data
    const errorData = {
      errorMessage: err.message || 'Unknown error',
      errorName: err.name || 'Unknown',
      errorStack: err.stack ? err.stack.substring(0, 200) : undefined,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    await enhancedLogger.logWithFullContext(
      LogLevel.WARN,
      'Weather API error - returning mock data',
      'WeatherAPI',
      errorData
    );

    // Return enhanced mock weather data for any error (timeout, network, etc.)
    const mockWeatherData = {
      current: {
        temp: 72,
        feels_like: 75,
        humidity: 60,
        visibility: 10000,
        wind_speed: 5,
        weather: [
          {
            id: 800,
            main: 'Clear',
            description: 'clear sky',
            icon: '01d'
          }
        ]
      },
      daily: Array.from({ length: 7 }, (_, i) => ({
        dt: Math.floor(Date.now() / 1000) + i * 24 * 60 * 60,
        temp: {
          day: 70 + Math.floor(Math.random() * 20),
          night: 55 + Math.floor(Math.random() * 15),
          min: 55 + Math.floor(Math.random() * 15),
          max: 70 + Math.floor(Math.random() * 20)
        },
        weather: [
          {
            id: i % 3 === 0 ? 500 : i % 2 === 0 ? 801 : 800,
            main: i % 3 === 0 ? 'Rain' : i % 2 === 0 ? 'Clouds' : 'Clear',
            description:
              i % 3 === 0
                ? 'light rain'
                : i % 2 === 0
                  ? 'few clouds'
                  : 'clear sky',
            icon: i % 3 === 0 ? '10d' : i % 2 === 0 ? '02d' : '01d'
          }
        ]
      }))
    };

    const response = NextResponse.json(mockWeatherData);
    response.headers.set('X-Mock-Data', 'true');
    response.headers.set(
      'X-Fallback-Reason',
      err.name === 'AbortError' ? 'Timeout' : 'Network Error'
    );
    response.headers.set('Cache-Control', 'public, max-age=60'); // Cache mock data for 1 minute
    return response;
  }
}
