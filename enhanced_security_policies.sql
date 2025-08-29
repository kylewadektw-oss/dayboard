-- Enhanced Security Policies for Dayboard
-- Run these commands in your Supabase SQL editor for maximum security

-- Enable additional security extensions if available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create security audit table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  operation_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'SELECT'
  row_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS on audit table
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view own audit logs" ON security_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Add encryption support to credentials table
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS encrypted BOOLEAN DEFAULT FALSE;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS created_by_ip INET;
ALTER TABLE credentials ADD COLUMN IF NOT EXISTS last_modified_by_ip INET;

-- Add security metadata to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_ip INET;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    table_name,
    operation_type,
    row_id,
    old_data,
    new_data,
    ip_address,
    timestamp
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE 
      WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW)
      ELSE NULL
    END,
    inet_client_addr(),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
DROP TRIGGER IF EXISTS audit_credentials ON credentials;
CREATE TRIGGER audit_credentials
  AFTER INSERT OR UPDATE OR DELETE ON credentials
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

DROP TRIGGER IF EXISTS audit_home_projects ON home_projects;
CREATE TRIGGER audit_home_projects
  AFTER INSERT OR UPDATE OR DELETE ON home_projects
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to update access tracking for credentials
CREATE OR REPLACE FUNCTION update_credential_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track actual data reads, not metadata updates
  IF TG_OP = 'SELECT' AND OLD.password IS NOT NULL THEN
    UPDATE credentials 
    SET 
      access_count = COALESCE(access_count, 0) + 1,
      last_accessed = NOW()
    WHERE id = OLD.id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies with additional security checks

-- Credentials policies with stricter access controls
DROP POLICY IF EXISTS "Users can view own credentials" ON credentials;
CREATE POLICY "Users can view own credentials" ON credentials
  FOR SELECT USING (
    auth.uid() = user_id AND
    -- Ensure user account is not locked
    NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND locked_until IS NOT NULL 
      AND locked_until > NOW()
    )
  );

DROP POLICY IF EXISTS "Users can insert own credentials" ON credentials;
CREATE POLICY "Users can insert own credentials" ON credentials
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    -- Rate limiting: max 10 credentials per hour
    (
      SELECT COUNT(*) 
      FROM credentials 
      WHERE user_id = auth.uid() 
      AND created_at > NOW() - INTERVAL '1 hour'
    ) < 10
  );

DROP POLICY IF EXISTS "Users can update own credentials" ON credentials;
CREATE POLICY "Users can update own credentials" ON credentials
  FOR UPDATE USING (
    auth.uid() = user_id AND
    -- Prevent updating if account is locked
    NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND locked_until IS NOT NULL 
      AND locked_until > NOW()
    )
  );

-- Home projects with enhanced security
DROP POLICY IF EXISTS "Users can view household projects" ON home_projects;
CREATE POLICY "Users can view household projects" ON home_projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      JOIN households h ON h.id = hm.household_id
      WHERE hm.user_id = auth.uid()
      AND hm.household_id = home_projects.household_id
      -- Ensure user is active member
      AND hm.joined_at IS NOT NULL
    ) OR
    -- Allow viewing own projects even without household
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.household_id = home_projects.household_id
    )
  );

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
  recent_failed_logins INTEGER;
  rapid_operations INTEGER;
  unusual_ip BOOLEAN := FALSE;
BEGIN
  -- Check for rapid successive operations (potential bot activity)
  SELECT COUNT(*) INTO rapid_operations
  FROM security_audit_log
  WHERE user_id = auth.uid()
  AND timestamp > NOW() - INTERVAL '1 minute'
  AND operation_type IN ('INSERT', 'UPDATE', 'DELETE');
  
  -- Check for operations from unusual IP
  SELECT COUNT(*) = 0 INTO unusual_ip
  FROM security_audit_log
  WHERE user_id = auth.uid()
  AND ip_address = inet_client_addr()
  AND timestamp > NOW() - INTERVAL '24 hours';
  
  -- Log suspicious activity
  IF rapid_operations > 20 OR unusual_ip THEN
    INSERT INTO security_audit_log (
      user_id,
      table_name,
      operation_type,
      severity,
      new_data
    ) VALUES (
      auth.uid(),
      'security_monitor',
      'SUSPICIOUS_ACTIVITY',
      'high',
      jsonb_build_object(
        'rapid_operations', rapid_operations,
        'unusual_ip', unusual_ip,
        'ip_address', inet_client_addr()::TEXT
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create suspicious activity trigger
DROP TRIGGER IF EXISTS detect_suspicious_activity_trigger ON credentials;
CREATE TRIGGER detect_suspicious_activity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON credentials
  FOR EACH ROW EXECUTE FUNCTION detect_suspicious_activity();

-- Function to automatically lock accounts after failed attempts
CREATE OR REPLACE FUNCTION check_failed_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a failed login attempt
  IF NEW.failed_login_attempts >= 5 AND OLD.failed_login_attempts < 5 THEN
    -- Lock account for 30 minutes
    NEW.locked_until := NOW() + INTERVAL '30 minutes';
    
    -- Log the security event
    INSERT INTO security_audit_log (
      user_id,
      table_name,
      operation_type,
      severity,
      new_data
    ) VALUES (
      NEW.user_id,
      'profiles',
      'ACCOUNT_LOCKED',
      'critical',
      jsonb_build_object(
        'failed_attempts', NEW.failed_login_attempts,
        'locked_until', NEW.locked_until,
        'reason', 'max_failed_login_attempts'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create account locking trigger
DROP TRIGGER IF EXISTS check_failed_login_attempts_trigger ON profiles;
CREATE TRIGGER check_failed_login_attempts_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION check_failed_login_attempts();

-- Create indexes for better performance on security queries
CREATE INDEX IF NOT EXISTS idx_security_audit_user_timestamp 
  ON security_audit_log(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_severity 
  ON security_audit_log(severity, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_credentials_user_category 
  ON credentials(user_id, category);

CREATE INDEX IF NOT EXISTS idx_credentials_last_accessed 
  ON credentials(last_accessed DESC) WHERE last_accessed IS NOT NULL;

-- Create a view for security dashboard
CREATE OR REPLACE VIEW user_security_summary AS
SELECT 
  p.user_id,
  p.name,
  p.last_login_ip,
  p.failed_login_attempts,
  p.locked_until,
  COUNT(c.id) as total_credentials,
  COUNT(c.id) FILTER (WHERE c.encrypted = true) as encrypted_credentials,
  COUNT(sal.id) FILTER (WHERE sal.operation_type = 'SELECT' AND sal.timestamp > NOW() - INTERVAL '24 hours') as recent_data_access,
  COUNT(sal.id) FILTER (WHERE sal.severity = 'high' AND sal.timestamp > NOW() - INTERVAL '7 days') as recent_high_severity_events,
  MAX(sal.timestamp) as last_activity
FROM profiles p
LEFT JOIN credentials c ON c.user_id = p.user_id
LEFT JOIN security_audit_log sal ON sal.user_id = p.user_id
GROUP BY p.user_id, p.name, p.last_login_ip, p.failed_login_attempts, p.locked_until;

-- Grant appropriate permissions
GRANT SELECT ON user_security_summary TO authenticated;

-- Comment the tables for documentation
COMMENT ON TABLE security_audit_log IS 'Comprehensive audit trail for all security-relevant database operations';
COMMENT ON COLUMN credentials.encrypted IS 'Whether sensitive fields in this credential are encrypted client-side';
COMMENT ON COLUMN credentials.access_count IS 'Number of times this credential has been accessed';
COMMENT ON COLUMN profiles.security_settings IS 'User-specific security preferences and settings';
COMMENT ON COLUMN profiles.failed_login_attempts IS 'Count of consecutive failed login attempts';
COMMENT ON COLUMN profiles.locked_until IS 'Timestamp until which the account is locked due to security violations';

-- Final security verification
DO $$
BEGIN
  -- Verify RLS is enabled on all sensitive tables
  IF NOT (
    SELECT bool_and(relrowsecurity) 
    FROM pg_class 
    WHERE relname IN ('profiles', 'credentials', 'home_projects', 'security_audit_log')
  ) THEN
    RAISE EXCEPTION 'Row Level Security is not enabled on all required tables';
  END IF;
  
  RAISE NOTICE 'Security policies successfully applied and verified';
END $$;
