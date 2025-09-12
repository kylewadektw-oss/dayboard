import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SecurityViolation {
  type: string;
  domain?: string;
  origin?: string;
  userAgent?: string;
  timestamp: string;
  fingerprint?: string;
  url?: string;
  referrer?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const violation: SecurityViolation = await request.json();
    
    // Get client IP address
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Log the violation
    console.error('🚨 SECURITY VIOLATION DETECTED:', {
      type: violation.type,
      domain: violation.domain,
      userAgent: violation.userAgent,
      timestamp: violation.timestamp,
      ip: clientIP
    });

    // Store in database for analysis
    const { error } = await supabase
      .from('security_violations')
      .insert({
        violation_type: violation.type,
        domain: violation.domain,
        origin: violation.origin,
        user_agent: violation.userAgent,
        ip_address: clientIP,
        fingerprint: violation.fingerprint,
        url: violation.url,
        referrer: violation.referrer,
        metadata: violation,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log security violation:', error);
    }

    // Send immediate alert for critical violations
    const criticalTypes = ['unauthorized_domain', 'debugger_detected', 'copyright_tampering'];
    if (criticalTypes.includes(violation.type)) {
      await sendSecurityAlert(violation, clientIP);
    }

    return NextResponse.json({ status: 'logged' });

  } catch (error) {
    console.error('Security violation handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendSecurityAlert(violation: SecurityViolation, clientIP: string) {
  try {
    // Send email alert (you'd integrate with your email service)
    const alertData = {
      to: 'kyle.wade.ktw@gmail.com',
      subject: `🚨 DAYBOARD SECURITY VIOLATION: ${violation.type}`,
      html: `
        <h2>Security Violation Detected</h2>
        <p><strong>Type:</strong> ${violation.type}</p>
        <p><strong>Domain:</strong> ${violation.domain || 'Unknown'}</p>
        <p><strong>IP Address:</strong> ${clientIP}</p>
        <p><strong>User Agent:</strong> ${violation.userAgent || 'Unknown'}</p>
        <p><strong>Timestamp:</strong> ${violation.timestamp}</p>
        <p><strong>URL:</strong> ${violation.url || 'Unknown'}</p>
        <p><strong>Referrer:</strong> ${violation.referrer || 'None'}</p>
        
        <h3>Action Required:</h3>
        <ul>
          <li>Investigate the source of this violation</li>
          <li>Consider blocking the IP if malicious</li>
          <li>Review and update security measures if needed</li>
        </ul>
        
        <p><em>This is an automated security alert from the Dayboard protection system.</em></p>
      `
    };

    // You would integrate with your preferred email service here
    // Example: await sendEmail(alertData);
    
    console.log('Security alert would be sent:', alertData.subject);
    
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
}
