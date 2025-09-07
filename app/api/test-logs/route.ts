import { createClient } from '@/utils/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    
    console.log('🔍 Testing database connection...');
    
    // Test basic query
    const { data, error } = await (supabase as any)
      .from('application_logs')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
      return Response.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }
    
    console.log('✅ Database query successful, found', data?.length || 0, 'logs');
    
    return Response.json({ 
      success: true, 
      count: data?.length || 0,
      logs: data 
    });
    
  } catch (error: any) {
    console.error('❌ API error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
