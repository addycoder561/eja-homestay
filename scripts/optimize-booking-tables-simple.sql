-- =====================================================
-- SIMPLIFIED BOOKING TABLES OPTIMIZATION SCRIPT
-- =====================================================
-- This script optimizes the existing tables (rooms, room_inventory) for better performance
-- Run this script in Supabase SQL Editor

-- =====================================================
-- STEP 1: ADD PERFORMANCE INDEXES (ONLY FOR EXISTING TABLES)
-- =====================================================

-- Rooms table indexes
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON public.rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON public.rooms(price);

-- Room inventory indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_date ON public.room_inventory(room_id, date);
CREATE INDEX IF NOT EXISTS idx_room_inventory_date ON public.room_inventory(date);
CREATE INDEX IF NOT EXISTS idx_room_inventory_available ON public.room_inventory(available) WHERE available > 0;
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_available ON public.room_inventory(room_id, available) WHERE available > 0;

-- =====================================================
-- STEP 2: CREATE OPTIMIZED VIEWS
-- =====================================================

-- View for room availability with room details
CREATE OR REPLACE VIEW public.room_availability_view AS
SELECT 
    ri.id as inventory_id,
    ri.room_id,
    ri.date,
    ri.available,
    r.property_id,
    r.name as room_name,
    r.room_type,
    r.price,
    r.total_inventory,
    r.amenities,
    r.max_guests,
    p.title as property_name,
    p.city as property_location,
    CASE 
        WHEN ri.available > 0 THEN 'available'
        WHEN ri.available = 0 THEN 'booked'
        ELSE 'unavailable'
    END as availability_status
FROM public.room_inventory ri
JOIN public.rooms r ON ri.room_id = r.id
JOIN public.properties p ON r.property_id = p.id
WHERE ri.date >= CURRENT_DATE
ORDER BY ri.date, r.property_id, r.name;

-- View for property room summary
CREATE OR REPLACE VIEW public.property_rooms_summary AS
SELECT 
    p.id as property_id,
    p.title as property_name,
    p.city as location,
    COUNT(r.id) as total_rooms,
    COUNT(CASE WHEN r.room_type = 'standard' THEN 1 END) as standard_rooms,
    COUNT(CASE WHEN r.room_type = 'deluxe' THEN 1 END) as deluxe_rooms,
    COUNT(CASE WHEN r.room_type = 'premium' THEN 1 END) as premium_rooms,
    MIN(r.price) as min_price,
    MAX(r.price) as max_price,
    AVG(r.price) as avg_price,
    SUM(r.total_inventory) as total_capacity
FROM public.properties p
LEFT JOIN public.rooms r ON p.id = r.property_id
GROUP BY p.id, p.title, p.city;

-- View for room availability calendar (next 30 days)
CREATE OR REPLACE VIEW public.room_calendar_view AS
SELECT 
    r.id as room_id,
    r.name as room_name,
    r.room_type,
    r.price,
    r.property_id,
    p.title as property_name,
    ri.date,
    ri.available,
    r.total_inventory - ri.available as booked,
    CASE 
        WHEN ri.available = 0 THEN 'Fully Booked'
        WHEN ri.available < r.total_inventory THEN 'Partially Available'
        ELSE 'Available'
    END as status
FROM public.rooms r
JOIN public.properties p ON r.property_id = p.id
JOIN public.room_inventory ri ON r.id = ri.room_id
WHERE ri.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY ri.date, r.property_id, r.name;

-- =====================================================
-- STEP 3: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get room availability for a date range
CREATE OR REPLACE FUNCTION public.get_room_availability(
    p_room_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    available INTEGER,
    total_inventory INTEGER,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ri.date,
        ri.available,
        r.total_inventory,
        CASE 
            WHEN ri.available = 0 THEN 'Fully Booked'
            WHEN ri.available < r.total_inventory THEN 'Partially Available'
            ELSE 'Available'
        END as status
    FROM public.room_inventory ri
    JOIN public.rooms r ON ri.room_id = r.id
    WHERE ri.room_id = p_room_id 
    AND ri.date BETWEEN p_start_date AND p_end_date
    ORDER BY ri.date;
END;
$$ LANGUAGE plpgsql;

-- Function to update room availability
CREATE OR REPLACE FUNCTION public.update_room_availability(
    p_room_id UUID,
    p_date DATE,
    p_available INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.room_inventory 
    SET available = p_available, updated_at = NOW()
    WHERE room_id = p_room_id AND date = p_date;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get property availability summary
CREATE OR REPLACE FUNCTION public.get_property_availability(
    p_property_id UUID,
    p_date DATE
)
RETURNS TABLE (
    room_id UUID,
    room_name TEXT,
    room_type TEXT,
    price NUMERIC,
    available INTEGER,
    total_inventory INTEGER,
    occupancy_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as room_id,
        r.name as room_name,
        r.room_type,
        r.price,
        COALESCE(ri.available, r.total_inventory) as available,
        r.total_inventory,
        CASE 
            WHEN r.total_inventory > 0 THEN 
                ((r.total_inventory - COALESCE(ri.available, r.total_inventory))::NUMERIC / r.total_inventory) * 100
            ELSE 0
        END as occupancy_rate
    FROM public.rooms r
    LEFT JOIN public.room_inventory ri ON r.id = ri.room_id AND ri.date = p_date
    WHERE r.property_id = p_property_id
    ORDER BY r.room_type, r.price;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 4: ADD TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger to ensure room inventory exists for new rooms
CREATE OR REPLACE FUNCTION public.create_room_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Create inventory records for the next 365 days
    INSERT INTO public.room_inventory (room_id, date, available, created_at)
    SELECT 
        NEW.id,
        CURRENT_DATE + (generate_series(0, 364) || ' days')::INTERVAL,
        NEW.total_inventory,
        NOW()
    FROM generate_series(0, 364);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new rooms
DROP TRIGGER IF EXISTS trigger_create_room_inventory ON public.rooms;
CREATE TRIGGER trigger_create_room_inventory
    AFTER INSERT ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.create_room_inventory();

-- Trigger to update room inventory when total_inventory changes
CREATE OR REPLACE FUNCTION public.update_room_inventory_on_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update future inventory records
    UPDATE public.room_inventory 
    SET available = NEW.total_inventory
    WHERE room_id = NEW.id 
    AND date >= CURRENT_DATE
    AND available = OLD.total_inventory;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room updates
DROP TRIGGER IF EXISTS trigger_update_room_inventory ON public.rooms;
CREATE TRIGGER trigger_update_room_inventory
    AFTER UPDATE OF total_inventory ON public.rooms
    FOR EACH ROW
    WHEN (OLD.total_inventory IS DISTINCT FROM NEW.total_inventory)
    EXECUTE FUNCTION public.update_room_inventory_on_change();

-- Trigger to validate room inventory data integrity
CREATE OR REPLACE FUNCTION public.validate_room_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if available doesn't exceed total inventory
    IF NEW.available > (
        SELECT total_inventory 
        FROM public.rooms 
        WHERE id = NEW.room_id
    ) THEN
        RAISE EXCEPTION 'Available inventory cannot exceed total inventory for room %', NEW.room_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room inventory validation
DROP TRIGGER IF EXISTS trigger_validate_room_inventory ON public.room_inventory;
CREATE TRIGGER trigger_validate_room_inventory
    BEFORE INSERT OR UPDATE ON public.room_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_room_inventory();

-- =====================================================
-- STEP 5: ADD CONSTRAINTS FOR DATA INTEGRITY
-- =====================================================

-- Add check constraints (simple ones only)
ALTER TABLE public.room_inventory 
ADD CONSTRAINT check_available_positive 
CHECK (available >= 0);

ALTER TABLE public.rooms 
ADD CONSTRAINT check_price_positive 
CHECK (price > 0);

ALTER TABLE public.rooms 
ADD CONSTRAINT check_total_inventory_positive 
CHECK (total_inventory > 0);

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on views
GRANT SELECT ON public.room_availability_view TO authenticated;
GRANT SELECT ON public.property_rooms_summary TO authenticated;
GRANT SELECT ON public.room_calendar_view TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.get_room_availability(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_room_availability(UUID, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_property_availability(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_room_inventory() TO authenticated;

-- =====================================================
-- OPTIMIZATION COMPLETED
-- =====================================================
-- ✅ Performance indexes added for rooms and room_inventory
-- ✅ Optimized views created
-- ✅ Helper functions added
-- ✅ Data integrity triggers added
-- ✅ Constraints added
-- ✅ Permissions granted
-- 
-- NOTE: Booking tables (bookings, booking_rooms) were skipped as they are empty
-- and their structure is not yet defined. These can be optimized later when
-- the booking functionality is implemented.
-- =====================================================
