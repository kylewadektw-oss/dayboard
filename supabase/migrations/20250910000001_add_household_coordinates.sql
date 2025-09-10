-- Add coordinates column to households table for Google Maps integration
-- This will store latitude and longitude as JSON for map display

ALTER TABLE households 
ADD COLUMN IF NOT EXISTS coordinates jsonb DEFAULT NULL;

-- Add index for potential geographic queries
CREATE INDEX IF NOT EXISTS idx_households_coordinates ON households USING GIN(coordinates);

-- Add comment for documentation
COMMENT ON COLUMN households.coordinates IS 'Geographic coordinates as JSON {lat: number, lng: number} for map display';

-- Ensure existing households have NULL coordinates initially
UPDATE households 
SET coordinates = NULL 
WHERE coordinates IS NOT DISTINCT FROM '{}'::jsonb;
