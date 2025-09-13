// Internal monitoring endpoint for Dayboard ecosystem
// Handles monitoring data from all branch deployments

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Extract environment from URL or data
    const environment = data.environment || 
                       (typeof window !== 'undefined' ? 
                        window.location.hostname.split('.')[0] : 'unknown');
    
    // Log comprehensive monitoring data
    console.log('🏢 [BENTLOLABS MONITOR]', {
      timestamp: new Date().toISOString(),
      environment,
      source: data.url || request.headers.get('referer') || 'unknown',
      type: data.type || 'general',
      performance: data.performance || {},
      network: data.network || {},
      errors: data.errors || [],
      interactions: data.interactions || [],
      userAgent: request.headers.get('user-agent'),
      data
    });

    // Return success with environment info
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Bentlolabs monitoring data received',
      environment,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, User-Agent, Referer'
      }
    });

  } catch (error) {
    console.error('❌ [BENTLOLABS MONITOR ERROR]', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process monitoring data',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, User-Agent, Referer'
    }
  });
}

// Health check
export async function GET() {
  return new Response(JSON.stringify({
    service: 'Bentlolabs Enterprise Monitoring',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}