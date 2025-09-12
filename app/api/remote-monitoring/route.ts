/*
 * 🌐 REMOTE MONITORING API ENDPOINT
 * 
 * Receives monitoring data from bentlolabs.com and other remote sites
 * and integrates it into the Dayboard logging system
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate the incoming data
    if (!data.site || !data.url) {
      return NextResponse.json({ error: 'Invalid monitoring data' }, { status: 400 });
    }
    
    const {
      site,
      url,
      timestamp,
      performance,
      errors,
      interactions,
      network,
      batchId
    } = data;
    
    // Log performance metrics
    if (performance && Object.keys(performance).length > 0) {
      logger.info(`📊 Performance metrics from ${site}`, 'RemoteMonitor', {
        site,
        url,
        performance,
        batchId,
        source: 'remote',
        monitoringType: 'performance'
      });
    }
    
    // Log errors
    if (errors && errors.length > 0) {
      for (const error of errors) {
        logger.error(`🚨 Remote error from ${site}: ${error.message}`, 'RemoteMonitor', {
          site,
          url,
          error,
          batchId,
          source: 'remote',
          monitoringType: 'error',
          stack: error.stack,
          filename: error.filename,
          lineno: error.lineno
        });
      }
    }
    
    // Log user interactions
    if (interactions && interactions.length > 0) {
      logger.info(`👆 User interactions from ${site} (${interactions.length} events)`, 'RemoteMonitor', {
        site,
        url,
        interactions,
        batchId,
        source: 'remote',
        monitoringType: 'interactions'
      });
    }
    
    // Log network requests
    if (network && network.length > 0) {
      logger.info(`🌐 Network activity from ${site} (${network.length} requests)`, 'RemoteMonitor', {
        site,
        url,
        network: network.slice(0, 10), // Limit to first 10 to avoid huge logs
        totalRequests: network.length,
        batchId,
        source: 'remote',
        monitoringType: 'network'
      });
    }
    
    // Log general monitoring heartbeat
    logger.info(`💓 Monitoring heartbeat from ${site}`, 'RemoteMonitor', {
      site,
      url,
      timestamp,
      batchId,
      source: 'remote',
      monitoringType: 'heartbeat',
      dataTypes: {
        hasPerformance: !!performance,
        errorCount: errors?.length || 0,
        interactionCount: interactions?.length || 0,
        networkCount: network?.length || 0
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring data received',
      timestamp: new Date().toISOString(),
      batchId
    });
    
  } catch (error) {
    logger.error('❌ Failed to process remote monitoring data', 'RemoteMonitorAPI', {
      error: error instanceof Error ? error.message : String(error),
      source: 'remote-api'
    });
    
    return NextResponse.json({ 
      error: 'Failed to process monitoring data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle CORS for cross-origin requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}