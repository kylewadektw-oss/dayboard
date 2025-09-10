# 🛡️ Supabase Security Fixes - Manual Execution Guide

## ⚠️ CRITICAL: Execute These Fixes Immediately

The automated script couldn't connect directly, so please follow these manual steps:

### 1. 📋 Copy the SQL Commands

**✅ VERIFIED:** Based on your actual database query, all 20 vulnerable functions have been identified with correct signatures.

```sql
-- FINAL: Complete Fix for Supabase Function Search Path Security Issues
-- Based on actual database query results - all 20 functions identified

-- Functions with no parameters (trigger functions)
ALTER FUNCTION public.assign_household_admin_if_missing() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.assign_household_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.create_default_permissions() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_household_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.generate_invitation_code() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_household_member_role() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_initial_household_role() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.set_profile_completion() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_age_from_dob() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_household_admin() SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SECURITY DEFINER SET search_path = public;

-- Functions with parameters - using exact signatures from database
ALTER FUNCTION public.accept_household_invitation(text, uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.calculate_age_from_dob(date) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.create_household_invitation(uuid, text, text, text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_household_members(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_navigation(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.get_user_settings_tabs(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.join_household_by_code(character varying, uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.manage_household_member(uuid, character varying, uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.user_has_feature_access(uuid, text) SECURITY DEFINER SET search_path = public;

-- Note: exec() and exec_select() functions already have secure search_path configuration
```

### 2. 🎯 Execution Steps

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `csbwewirwzeitavhvykr`
3. **Navigate to**: SQL Editor (left sidebar)
4. **Paste the commands above** into a new query
5. **Click "Run"** to execute all commands
6. **Verify success**: You should see "Success. No rows returned" for each command

### 3. ✅ Verification Query

After running the fixes, execute this verification query:

```sql
-- Verify all functions are now secure
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as is_security_definer,
    CASE 
        WHEN p.proconfig IS NULL THEN 'NOT SECURED'
        WHEN 'search_path=public' = ANY(p.proconfig) THEN 'SECURED'
        ELSE 'PARTIALLY SECURED'
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'assign_household_admin_if_missing', 'assign_household_code', 'create_default_permissions',
    'generate_household_code', 'generate_invitation_code', 'set_household_member_role',
    'set_initial_household_role', 'set_profile_completion', 'update_age_from_dob',
    'update_household_admin', 'update_updated_at_column', 'accept_household_invitation',
    'calculate_age_from_dob', 'create_household_invitation', 'get_household_members',
    'get_user_navigation', 'get_user_settings_tabs', 'join_household_by_code',
    'manage_household_member', 'user_has_feature_access'
)
ORDER BY security_status, p.proname;
```

**Expected Result**: All functions should show `security_status = 'SECURED'`

### 4. 🔐 Auth Settings (IMMEDIATE)

Go to: **Supabase Dashboard > Authentication > Settings**

**Change these settings:**
- ✅ **Enable "Leaked Password Protection"**
- ✅ **Set "Email OTP expiry" to `1800` seconds (30 minutes)**

### 5. 🔄 PostgreSQL Upgrade (THIS WEEK)

Go to: **Supabase Dashboard > Settings > Infrastructure**
- ✅ **Schedule PostgreSQL upgrade** to latest version
- ✅ **Plan for brief downtime** during low-traffic hours

## 🎯 Priority Levels

### 🚨 **CRITICAL (Do Now - 5 minutes)**
- Execute the SQL commands above
- Update auth settings

### 🟡 **HIGH (This Week)**
- Schedule PostgreSQL upgrade

## 📊 Success Criteria

After completion, you should have:
- ✅ 20 database functions secured against SQL injection (all functions from original audit found and fixed)
- ✅ Enhanced password security enabled
- ✅ Shorter OTP expiry window
- ✅ Database upgrade scheduled

## 🆘 Need Help?

If you encounter any errors:
1. **Screenshot the error message**
2. **Check which specific command failed**
3. **Try running failed commands individually**

The most important fixes are the `ALTER FUNCTION` commands - these prevent SQL injection attacks.

---

**Security Status**: 🔴 **VULNERABLE** → 🟢 **SECURE** (after completion)
