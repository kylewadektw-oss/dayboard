-- Function Diagnosis Script
-- Run this first to see which functions actually exist in your database

SELECT 
    p.proname as function_name,
    p.pronargs as num_args,
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
AND p.proname LIKE ANY(ARRAY[
    '%household%', '%user%', '%profile%', '%permission%', '%auth%', 
    '%settings%', '%navigation%', '%member%', '%admin%', '%feature%'
])
ORDER BY p.proname, p.pronargs;

-- Also check for any functions with mutable search_path
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.proconfig as current_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.proconfig IS NULL OR NOT ('search_path=public' = ANY(p.proconfig)))
ORDER BY p.proname;
