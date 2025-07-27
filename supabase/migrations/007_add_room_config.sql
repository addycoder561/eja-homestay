-- Add room_config JSONB column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS room_config JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN properties.room_config IS 'JSON configuration for room types, pricing, and inventory for this property'; 