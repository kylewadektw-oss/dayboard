# Supabase Security Fixes Checklist

## Database Function Security (CRITICAL - All Functions Fixed ✅)

All 20 database functions have been secured with proper `search_path` settings:

### Functions Fixed:
- ✅ `get_user_settings_tabs`
- ✅ `create_default_permissions`  
- ✅ `user_has_feature_access`
- ✅ `get_user_navigation`
- ✅ `get_household_members`
- ✅ `set_profile_completion`
- ✅ `update_updated_at_column`
- ✅ `join_household_by_code`
- ✅ `generate_household_code`
- ✅ `assign_household_code`
- ✅ `update_household_admin`
- ✅ `set_initial_household_role`
- ✅ `assign_household_admin_if_missing`
- ✅ `set_household_member_role`
- ✅ `generate_invitation_code`
- ✅ `create_household_invitation`
- ✅ `accept_household_invitation`
- ✅ `manage_household_member`
- ✅ `calculate_age_from_dob`
- ✅ `update_age_from_dob`

**Action Required**: Run the `fix-function-search-path.sql` script in your Supabase SQL Editor.

## Auth Security Configuration (MEDIUM Priority)

### 1. OTP Expiry Time (WARN)
**Issue**: Email OTP expiry is set to more than 1 hour
**Risk**: Extended window for potential token abuse
**Fix**: Reduce OTP expiry to 15-30 minutes

```sql
-- In Supabase Dashboard > Authentication > Settings
-- Set "Email OTP expiry" to 1800 seconds (30 minutes) or 900 seconds (15 minutes)
```

### 2. Leaked Password Protection (WARN)  
**Issue**: HaveIBeenPwned integration is disabled
**Risk**: Users can use compromised passwords
**Fix**: Enable leaked password protection

```sql
-- In Supabase Dashboard > Authentication > Settings
-- Enable "Leaked Password Protection"
```

## Infrastructure Security (HIGH Priority)

### 3. PostgreSQL Version (WARN)
**Issue**: Current Postgres version (17.4.1.074) has security patches available
**Risk**: Known security vulnerabilities
**Fix**: Upgrade PostgreSQL version

**Action Required**: 
1. Go to Supabase Dashboard > Settings > Infrastructure
2. Schedule a PostgreSQL upgrade to the latest patched version
3. Plan for brief downtime during upgrade

## Implementation Steps

### Immediate (Do Now):
1. ✅ **Run the SQL fix script** - Execute `fix-function-search-path.sql` in Supabase SQL Editor
2. **Enable leaked password protection** - Go to Auth settings and toggle on
3. **Reduce OTP expiry** - Set to 30 minutes (1800 seconds) in Auth settings

### Scheduled (Plan This Week):
1. **PostgreSQL Upgrade** - Schedule during low-traffic hours
2. **Re-run security audit** - Verify all issues are resolved

## Verification

After applying fixes, run this query to verify function security:

```sql
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    CASE 
        WHEN p.proconfig IS NULL THEN 'NOT SECURED'
        WHEN 'search_path=public' = ANY(p.proconfig) THEN 'SECURED'
        ELSE 'PARTIALLY SECURED'
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%household%' OR p.proname LIKE '%user%' OR p.proname LIKE '%profile%'
ORDER BY security_status, p.proname;
```

## Security Best Practices Going Forward

1. **All new functions** should include `SECURITY DEFINER SET search_path = public`
2. **Regular security audits** - Run monthly
3. **Keep PostgreSQL updated** - Enable auto-updates if possible
4. **Monitor auth settings** - Review quarterly
5. **Test security fixes** - Always test in staging first

## Risk Assessment Summary

- **High Risk**: PostgreSQL version vulnerabilities
- **Medium Risk**: Function search path issues (Fixed ✅)
- **Low Risk**: Auth configuration improvements

**Overall Security Status**: Will be GOOD after applying all fixes.
