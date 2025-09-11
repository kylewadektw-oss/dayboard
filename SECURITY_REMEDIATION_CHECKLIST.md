# 🛡️ DAYBOARD SECURITY REMEDIATION CHECKLIST

## IMMEDIATE ACTIONS REQUIRED

### 1. AUTH OTP EXPIRY CONFIGURATION ⚠️
- [ ] Login to Supabase Dashboard
- [ ] Navigate to Auth > Settings
- [ ] Locate "Email OTP Settings"
- [ ] Set expiry to 1800 seconds (30 minutes)
- [ ] Save changes
- [ ] Verify new setting is applied

### 2. LEAKED PASSWORD PROTECTION ⚠️
- [ ] Stay in Auth > Settings
- [ ] Find "Password Security" section
- [ ] Enable "Check against HaveIBeenPwned database"
- [ ] Save changes
- [ ] Test with a known compromised password

### 3. POSTGRES VERSION UPGRADE ⚠️
- [ ] Navigate to Settings > Database
- [ ] Check current version: supabase-postgres-17.4.1.074
- [ ] Review available upgrades
- [ ] Schedule maintenance window
- [ ] Perform upgrade during low-traffic period
- [ ] Verify upgrade completion

## SECURITY IMPACT
- **OTP Expiry**: Reduces attack window for email-based authentication
- **Password Protection**: Prevents use of known compromised passwords  
- **Postgres Upgrade**: Applies critical security patches

## VERIFICATION
After completing all steps:
- [ ] Re-run Supabase security scan
- [ ] Verify no warnings for these three issues
- [ ] Document completion date and settings

## NOTES
- All changes require Supabase Dashboard access
- Postgres upgrade may require brief downtime
- Test authentication flow after OTP changes
- Monitor for any authentication issues post-changes

---
**Priority**: HIGH - Address within 24-48 hours
**Impact**: SECURITY - Protects against known vulnerabilities
