-- Create table for security violation logging
CREATE TABLE IF NOT EXISTS security_violations (
    id BIGSERIAL PRIMARY KEY,
    violation_type TEXT NOT NULL,
    domain TEXT,
    origin TEXT,
    user_agent TEXT,
    ip_address TEXT,
    fingerprint TEXT,
    url TEXT,
    referrer TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_violations_type ON security_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_security_violations_created_at ON security_violations(created_at);
CREATE INDEX IF NOT EXISTS idx_security_violations_ip ON security_violations(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_violations_domain ON security_violations(domain);

-- Enable RLS
ALTER TABLE security_violations ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to insert and read (for logging system)
CREATE POLICY "service_role_full_access" ON security_violations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy to prevent regular users from accessing security logs
CREATE POLICY "no_user_access" ON security_violations
    FOR ALL
    TO authenticated
    USING (false);

-- Add comment for documentation
COMMENT ON TABLE security_violations IS 'Logs security violations and unauthorized access attempts for IP protection and monitoring';
