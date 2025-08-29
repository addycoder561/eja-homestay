-- =====================================================
-- UNIFIED SEARCH VIEW FOR ALL CARD TYPES
-- =====================================================
-- Create a unified view for searching across properties, experiences, and retreats
-- Run this script in Supabase SQL Editor

-- =====================================================
-- CREATE UNIFIED SEARCH VIEW
-- =====================================================

CREATE OR REPLACE VIEW public.unified_search_view AS
SELECT 
    id,
    'property' as card_type,
    title,
    subtitle,
    description,
    COALESCE(city, '') as location,
    price_per_night as price,
    currency,
    cover_image,
    images,
    tags as categories,
    average_rating,
    review_count,
    google_rating,
    google_reviews_count,
    host_name,
    host_type,
    host_tenure,
    host_description,
    host_image,
    host_usps,
    unique_propositions,
    is_available as is_active,
    created_at,
    updated_at,
    -- Property-specific fields
    property_type,
    room_type,
    max_guests,
    bedrooms,
    beds,
    bathrooms,
    amenities,
    min_nights,
    max_nights,
    cancellation_policy,
    house_rules,
    check_in_time,
    check_out_time,
    usps,
    room_config,
    google_last_updated,
    google_place_id,
    -- Placeholder fields for non-property cards
    NULL as duration,
    NULL as latitude,
    NULL as longitude,
    NULL as address,
    NULL as postal_code
FROM public.properties

UNION ALL

SELECT 
    id,
    'experience' as card_type,
    title,
    NULL as subtitle,
    description,
    location,
    price,
    'INR' as currency, -- Default currency
    cover_image,
    CASE 
        WHEN images IS NOT NULL AND images != '' 
        THEN string_to_array(images, ',') 
        ELSE ARRAY[]::text[]
    END as images,
    categories,
    NULL as average_rating,
    NULL as review_count,
    NULL as google_rating,
    NULL as google_reviews_count,
    host_name,
    host_type,
    host_tenure,
    host_description,
    host_image,
    host_usps,
    unique_propositions,
    is_active,
    created_at,
    updated_at,
    -- Experience-specific fields
    NULL as property_type,
    NULL as room_type,
    NULL as max_guests,
    NULL as bedrooms,
    NULL as beds,
    NULL as bathrooms,
    NULL as amenities,
    NULL as min_nights,
    NULL as max_nights,
    NULL as cancellation_policy,
    NULL as house_rules,
    NULL as check_in_time,
    NULL as check_out_time,
    NULL as usps,
    NULL as room_config,
    NULL as google_last_updated,
    NULL as google_place_id,
    -- Experience-specific fields
    duration,
    NULL as latitude,
    NULL as longitude,
    NULL as address,
    NULL as postal_code
FROM public.experiences

UNION ALL

SELECT 
    id,
    'retreat' as card_type,
    title,
    subtitle,
    description,
    location,
    price,
    'INR' as currency, -- Default currency
    cover_image,
    images,
    CASE 
        WHEN categories IS NOT NULL 
        THEN string_to_array(categories, ',') 
        ELSE ARRAY[]::text[]
    END as categories,
    NULL as average_rating,
    NULL as review_count,
    NULL as google_rating,
    NULL as google_reviews_count,
    host_name,
    host_type,
    host_tenure,
    host_description,
    host_image,
    host_usps,
    unique_propositions,
    is_active,
    created_at,
    updated_at,
    -- Retreat-specific fields
    NULL as property_type,
    NULL as room_type,
    NULL as max_guests,
    NULL as bedrooms,
    NULL as beds,
    NULL as bathrooms,
    NULL as amenities,
    NULL as min_nights,
    NULL as max_nights,
    NULL as cancellation_policy,
    NULL as house_rules,
    NULL as check_in_time,
    NULL as check_out_time,
    NULL as usps,
    NULL as room_config,
    NULL as google_last_updated,
    NULL as google_place_id,
    -- Retreat-specific fields
    duration,
    NULL as latitude,
    NULL as longitude,
    NULL as address,
    NULL as postal_code
FROM public.retreats;

-- =====================================================
-- CREATE SEARCH FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_all_cards(
    p_search_term TEXT DEFAULT NULL,
    p_card_types TEXT[] DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_locations TEXT[] DEFAULT NULL,
    p_categories TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    card_type TEXT,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    location TEXT,
    price NUMERIC,
    currency TEXT,
    cover_image TEXT,
    images TEXT[],
    categories TEXT[],
    average_rating NUMERIC,
    review_count INTEGER,
    google_rating NUMERIC,
    google_reviews_count INTEGER,
    host_name TEXT,
    host_type TEXT,
    host_tenure TEXT,
    host_description TEXT,
    host_image TEXT,
    host_usps TEXT[],
    unique_propositions TEXT[],
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    -- Property-specific fields
    property_type TEXT,
    room_type TEXT,
    max_guests INTEGER,
    bedrooms INTEGER,
    beds INTEGER,
    bathrooms INTEGER,
    amenities TEXT[],
    min_nights INTEGER,
    max_nights INTEGER,
    cancellation_policy TEXT,
    house_rules TEXT,
    check_in_time TEXT,
    check_out_time TEXT,
    usps TEXT[],
    room_config JSONB,
    google_last_updated TIMESTAMPTZ,
    google_place_id TEXT,
    -- Common fields
    duration TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    address TEXT,
    postal_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.unified_search_view
    WHERE is_active = true
    AND (
        p_search_term IS NULL 
        OR title ILIKE '%' || p_search_term || '%'
        OR description ILIKE '%' || p_search_term || '%'
        OR location ILIKE '%' || p_search_term || '%'
    )
    AND (
        p_card_types IS NULL 
        OR card_type = ANY(p_card_types)
    )
    AND (
        p_min_price IS NULL 
        OR price >= p_min_price
    )
    AND (
        p_max_price IS NULL 
        OR price <= p_max_price
    )
    AND (
        p_locations IS NULL 
        OR location = ANY(p_locations)
    )
    AND (
        p_categories IS NULL 
        OR categories && p_categories
    )
    ORDER BY 
        CASE 
            WHEN p_search_term IS NOT NULL AND title ILIKE '%' || p_search_term || '%' THEN 1
            WHEN p_search_term IS NOT NULL AND description ILIKE '%' || p_search_term || '%' THEN 2
            ELSE 3
        END,
        created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on the view
GRANT SELECT ON public.unified_search_view TO authenticated;
GRANT SELECT ON public.unified_search_view TO service_role;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION public.search_all_cards(TEXT, TEXT[], NUMERIC, NUMERIC, TEXT[], TEXT[], INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_cards(TEXT, TEXT[], NUMERIC, NUMERIC, TEXT[], TEXT[], INTEGER, INTEGER) TO service_role;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Search all cards
-- SELECT * FROM public.search_all_cards('mountain');

-- Example 2: Search only properties and experiences
-- SELECT * FROM public.search_all_cards('mountain', ARRAY['property', 'experience']);

-- Example 3: Search with price filter
-- SELECT * FROM public.search_all_cards('mountain', NULL, 1000, 5000);

-- Example 4: Search by location
-- SELECT * FROM public.search_all_cards(NULL, NULL, NULL, NULL, ARRAY['Kashmir', 'Mountains']);

-- =====================================================
-- UNIFIED SEARCH VIEW CREATED
-- =====================================================
-- ✅ Unified view for all card types
-- ✅ Advanced search function with filters
-- ✅ Maintains data integrity
-- ✅ No migration required
-- ✅ Better performance than merged table
-- =====================================================
