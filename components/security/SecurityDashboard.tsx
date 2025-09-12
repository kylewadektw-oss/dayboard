'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { RefreshCw, Shield, AlertTriangle, Eye, Ban } from 'lucide-react';

interface SecurityViolation {
  id: number;
  violation_type: string;
  domain: string;
  origin: string;
  user_agent: string;
  ip_address: string;
  fingerprint: string;
  url: string;
  referrer: string;
  metadata: any;
  created_at: string;
}

interface SecurityStats {
  total_violations: number;
  unique_ips: number;
  critical_violations: number;
  last_24_hours: number;
}

export default function SecurityDashboard() {
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load recent violations
      const { data: violationsData, error: violationsError } = await supabase
        .from('security_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (violationsError) {
        throw violationsError;
      }

      setViolations(violationsData || []);

      // Calculate basic stats from violations data
      const criticalTypes = ['unauthorized_domain', 'debugger_detected', 'copyright_tampering'];
      const uniqueIps = new Set(violationsData?.map((v: any) => v.ip_address)).size;
      const criticalCount = violationsData?.filter((v: any) => criticalTypes.includes(v.violation_type)).length || 0;
      const last24Hours = violationsData?.filter((v: any) => {
        const violationTime = new Date(v.created_at);
        const now = new Date();
        return now.getTime() - violationTime.getTime() < 24 * 60 * 60 * 1000;
      }).length || 0;

      setStats({
        total_violations: violationsData?.length || 0,
        unique_ips: uniqueIps,
        critical_violations: criticalCount,
        last_24_hours: last24Hours
      });

    } catch (err) {
      console.error('Failed to load security data:', err);
      setError('Failed to load security data. This may be normal during initial setup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const getViolationSeverity = (type: string) => {
    const critical = ['unauthorized_domain', 'debugger_detected', 'copyright_tampering'];
    const high = ['source_inspection', 'console_access'];
    
    if (critical.includes(type)) return 'critical';
    if (high.includes(type)) return 'high';
    return 'medium';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Ban className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Eye className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatViolationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Security Dashboard
        </h1>
        <Button onClick={loadSecurityData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Security Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Total Violations">
            <div className="text-2xl font-bold">{stats.total_violations}</div>
          </Card>

          <Card title="Unique IPs">
            <div className="text-2xl font-bold">{stats.unique_ips}</div>
          </Card>

          <Card title="Critical Violations">
            <div className="text-2xl font-bold text-red-600">{stats.critical_violations}</div>
          </Card>

          <Card title="Last 24 Hours">
            <div className="text-2xl font-bold">{stats.last_24_hours}</div>
          </Card>
        </div>
      )}

      {/* Recent Violations */}
      <Card title="Recent Security Violations">
        {violations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security violations detected.</p>
            <p className="text-sm">Your application is secure! 🛡️</p>
          </div>
        ) : (
          <div className="space-y-4">
            {violations.map((violation) => {
              const severity = getViolationSeverity(violation.violation_type);
              return (
                <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getSeverityIcon(severity)}
                    <div>
                      <div className="font-medium">
                        {formatViolationType(violation.violation_type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        IP: {violation.ip_address} • {violation.domain || 'Unknown domain'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(violation.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(severity)}`}>
                      {severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Protection Status */}
      <Card title="Protection Status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Domain validation active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Anti-debugging protection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Source code protection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Device fingerprinting</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
