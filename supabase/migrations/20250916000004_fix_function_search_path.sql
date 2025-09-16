-- Migration: Fix function search path security warnings
-- BentLo Labs LLC - Dayboard™
-- Date: September 16, 2025
-- Purpose: Fix mutable search_path warnings for functions

BEGIN;

-- Fix meal_slot_time function by adding search_path setting
CREATE OR REPLACE FUNCTION meal_slot_time(meal_type text)
RETURNS time 
LANGUAGE sql 
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT CASE LOWER($1)
    WHEN 'breakfast' THEN time '07:30'
    WHEN 'lunch'     THEN time '12:00'
    ELSE                  time '18:00'  -- dinner, dessert, anything else
  END;
$$;

-- Fix update_updated_at_column function by adding search_path setting
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Add comments explaining the security fix
COMMENT ON FUNCTION meal_slot_time(text) IS 'Returns default time for meal types. Uses empty search_path for security.';
COMMENT ON FUNCTION update_updated_at_column() IS 'Updates updated_at column to current timestamp. Uses empty search_path for security.';

COMMIT;