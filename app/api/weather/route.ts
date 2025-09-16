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

import { NextResponse } from 'next/server';
import { enhancedLogger, LogLevel } from '@/utils/logger';

export async function GET(req: Request) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const apiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;

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

    // Validate API key format (OpenWeatherMap keys are typically 32 characters)
    if (!apiKey || apiKey.length < 20) {
      await enhancedLogger.logWithFullContext(
        LogLevel.WARN,
        'OpenWeatherMap API key not configured - using mock data',
        'WeatherAPI',
        {
          apiKeyLength: apiKey?.length || 0
        }
      );

      // Return enhanced mock weather data when API key is not configured
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
      response.headers.set('Cache-Control', 'public, max-age=60'); // Cache mock data for 1 minute
      return response;
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
      'Fetching weather data',
      'WeatherAPI',
      {
        lat: parseFloat(latitude.toString()),
        lon: parseFloat(longitude.toString()),
        apiKeyPresent: !!apiKey
      }
    );

    // Fetch weather data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,alerts&units=imperial&appid=${apiKey}`;

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
        'OpenWeatherMap API error - falling back to mock data',
        'WeatherAPI',
        {
          status: res.status,
          statusText: res.statusText,
          errorMessage: errorText.substring(0, 200),
          lat: parseFloat(latitude.toString()),
          lon: parseFloat(longitude.toString()),
          url: weatherUrl.replace(apiKey, '[REDACTED]') // Don't log the API key
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

    // Validate response structure
    if (!data.current || !data.daily) {
      await enhancedLogger.logWithFullContext(
        LogLevel.ERROR,
        'Invalid weather API response structure',
        'WeatherAPI',
        {
          hasurrent: !!data.current,
          hasDaily: !!data.daily,
          responseKeys: Object.keys(data)
        }
      );

      return NextResponse.json(
        { error: 'Invalid weather data received' },
        { status: 502 }
      );
    }

    const responseTime = Date.now() - startTime;
    await enhancedLogger.logWithFullContext(
      LogLevel.INFO,
      'Weather data fetched successfully',
      'WeatherAPI',
      {
        lat: latitude,
        lon: longitude,
        responseTime: `${responseTime}ms`,
        currentTemp: data.current.temp,
        dailyForecastDays: data.daily.length
      }
    );

    // Add cache headers (5 minute cache)
    const response = NextResponse.json(data);
    response.headers.set(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=600'
    );
    response.headers.set('X-Response-Time', `${responseTime}ms`);

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
