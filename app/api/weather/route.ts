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

import { NextResponse } from "next/server";
import { enhancedLogger, LogLevel } from "@/utils/logger";

export async function GET(req: Request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const apiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;

    // Validate required parameters
    if (!lat || !lon) {
      await enhancedLogger.logWithFullContext(LogLevel.WARN, "Weather API called without lat/lon coordinates", "WeatherAPI", {
        lat,
        lon,
        url: req.url
      });
      
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Validate API key format (OpenWeatherMap keys are typically 32 characters)
    if (!apiKey || apiKey.length < 20) {
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "OpenWeatherMap API key not configured or invalid", "WeatherAPI", {
        apiKeyLength: apiKey?.length || 0
      });
      return NextResponse.json(
        { error: "Weather service temporarily unavailable - API key not configured" },
        { status: 503 }
      );
    }

    // Validate coordinate format
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      await enhancedLogger.logWithFullContext(LogLevel.WARN, "Invalid coordinates provided to weather API", "WeatherAPI", {
        lat: latitude,
        lon: longitude
      });
      
      return NextResponse.json(
        { error: "Invalid coordinates provided" },
        { status: 400 }
      );
    }

    await enhancedLogger.logWithFullContext(LogLevel.INFO, "Fetching weather data", "WeatherAPI", {
      lat: latitude,
      lon: longitude,
      apiKeyPresent: !!apiKey
    });

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
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "OpenWeatherMap API error", "WeatherAPI", {
        status: res.status,
        statusText: res.statusText,
        errorMessage: errorText.substring(0, 200), // Truncate error to avoid serialization issues
        lat: latitude,
        lon: longitude
      });

      // Handle specific API errors
      if (res.status === 401) {
        return NextResponse.json(
          { error: "Weather service authentication failed" },
          { status: 503 }
        );
      } else if (res.status === 404) {
        return NextResponse.json(
          { error: "Location not found" },
          { status: 404 }
        );
      } else if (res.status === 429) {
        return NextResponse.json(
          { error: "Weather service rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch weather data" },
        { status: 502 }
      );
    }

    const data = await res.json();
    
    // Validate response structure
    if (!data.current || !data.daily) {
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Invalid weather API response structure", "WeatherAPI", {
        hasurrent: !!data.current,
        hasDaily: !!data.daily,
        responseKeys: Object.keys(data)
      });
      
      return NextResponse.json(
        { error: "Invalid weather data received" },
        { status: 502 }
      );
    }

    const responseTime = Date.now() - startTime;
    await enhancedLogger.logWithFullContext(LogLevel.INFO, "Weather data fetched successfully", "WeatherAPI", {
      lat: latitude,
      lon: longitude,
      responseTime: `${responseTime}ms`,
      currentTemp: data.current.temp,
      dailyForecastDays: data.daily.length
    });

    // Add cache headers (5 minute cache)
    const response = NextResponse.json(data);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    
    return response;

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Weather API request timeout", "WeatherAPI", {
        responseTime: `${responseTime}ms`,
        timeoutLimit: "10000ms"
      });
      
      return NextResponse.json(
        { error: "Weather service timeout. Please try again." },
        { status: 504 }
      );
    }

    await enhancedLogger.logWithFullContext(LogLevel.ERROR, "Unexpected error in weather API", "WeatherAPI", {
      errorMessage: error?.message || 'Unknown error',
      errorName: error?.name || 'Unknown',
      responseTime: `${responseTime}ms`
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
