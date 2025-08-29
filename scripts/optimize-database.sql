-- Database Optimization Script for EJA
-- This script adds performance indexes and optimizations

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties USING gin(to_tsvector('english', city || ' ' || state || ' ' || country));
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON public.properties(price_per_night) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_properties_type_available ON public.properties(property_type, is_available);
CREATE INDEX IF NOT EXISTS idx_properties_amenities ON public.properties USING gin(amenities);
CREATE INDEX IF NOT EXISTS idx_properties_tags ON public.properties USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Add indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status ON public.bookings(check_in_date, check_out_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_property_guest ON public.bookings(property_id, guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Add indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_property_rating ON public.reviews(property_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Add indexes for experiences
CREATE INDEX IF NOT EXISTS idx_experiences_active ON public.experiences(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON public.experiences USING gin(to_tsvector('english', location));

-- Add indexes for retreats
CREATE INDEX IF NOT EXISTS idx_retreats_active ON public.retreats(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_retreats_location ON public.retreats USING gin(to_tsvector('english', location));

-- Add indexes for wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user_item ON public.wishlist(user_id, item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at DESC);

-- Add indexes for likes
CREATE INDEX IF NOT EXISTS idx_likes_user_item ON public.likes(user_id, item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_likes_count ON public.likes(item_id, item_type);

-- Add indexes for shares
CREATE INDEX IF NOT EXISTS idx_shares_user_item ON public.shares(user_id, item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_shares_count ON public.shares(item_id, item_type);

-- Add indexes for rooms and inventory
CREATE INDEX IF NOT EXISTS idx_rooms_property ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_date ON public.room_inventory(room_id, date);
CREATE INDEX IF NOT EXISTS idx_room_inventory_available ON public.room_inventory(room_id, date, available);

-- Add indexes for booking rooms
CREATE INDEX IF NOT EXISTS idx_booking_rooms_booking ON public.booking_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room ON public.booking_rooms(room_id);

-- Add indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_host ON public.profiles(is_host);

-- Add indexes for blogs
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON public.blogs USING gin(tags);

-- Add indexes for ad campaigns
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active ON public.ad_campaigns(is_active, start_date, end_date);

-- Add indexes for coupons
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- Add indexes for collaborations
CREATE INDEX IF NOT EXISTS idx_collaborations_user ON public.card_collaborations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborations_item ON public.card_collaborations(item_id, item_type);

-- Create materialized view for property statistics (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS property_stats AS
SELECT 
  p.id,
  p.title,
  p.city,
  p.state,
  p.country,
  p.price_per_night,
  p.property_type,
  p.max_guests,
  p.bedrooms,
  p.bathrooms,
  p.amenities,
  p.tags,
  p.is_available,
  p.created_at,
  COUNT(r.id) as review_count,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(b.id) as booking_count,
  COUNT(DISTINCT w.user_id) as wishlist_count,
  COUNT(DISTINCT l.user_id) as like_count
FROM public.properties p
LEFT JOIN public.reviews r ON p.id = r.property_id
LEFT JOIN public.bookings b ON p.id = b.property_id AND b.status IN ('confirmed', 'completed')
LEFT JOIN public.wishlist w ON p.id = w.item_id AND w.item_type = 'property'
LEFT JOIN public.likes l ON p.id = l.item_id AND l.item_type = 'property'
GROUP BY p.id, p.title, p.city, p.state, p.country, p.price_per_night, p.property_type, p.max_guests, p.bedrooms, p.bathrooms, p.amenities, p.tags, p.is_available, p.created_at;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_property_stats_location ON property_stats USING gin(to_tsvector('english', city || ' ' || state || ' ' || country));
CREATE INDEX IF NOT EXISTS idx_property_stats_type ON property_stats(property_type, is_available);
CREATE INDEX IF NOT EXISTS idx_property_stats_price ON property_stats(price_per_night) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_property_stats_rating ON property_stats(average_rating DESC, review_count DESC);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_property_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY property_stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to update property statistics
CREATE OR REPLACE FUNCTION update_property_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Refresh stats when properties, reviews, bookings, or wishlist changes
  PERFORM refresh_property_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-refresh stats
CREATE TRIGGER trigger_refresh_property_stats_properties
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_property_stats();

CREATE TRIGGER trigger_refresh_property_stats_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_property_stats();

CREATE TRIGGER trigger_refresh_property_stats_bookings
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_property_stats();

CREATE TRIGGER trigger_refresh_property_stats_wishlist
  AFTER INSERT OR UPDATE OR DELETE ON public.wishlist
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_property_stats();

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_properties(search_term TEXT, filters JSONB DEFAULT '{}')
RETURNS TABLE(
  id UUID,
  title TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  price_per_night DECIMAL,
  property_type TEXT,
  max_guests INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[],
  tags TEXT[],
  is_available BOOLEAN,
  created_at TIMESTAMPTZ,
  review_count BIGINT,
  average_rating NUMERIC,
  booking_count BIGINT,
  wishlist_count BIGINT,
  like_count BIGINT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.*,
    ts_rank(
      to_tsvector('english', ps.title || ' ' || ps.city || ' ' || ps.state || ' ' || ps.country),
      plainto_tsquery('english', search_term)
    ) as rank
  FROM property_stats ps
  WHERE 
    ps.is_available = true
    AND (
      search_term IS NULL 
      OR to_tsvector('english', ps.title || ' ' || ps.city || ' ' || ps.state || ' ' || ps.country) @@ plainto_tsquery('english', search_term)
    )
    AND (
      filters->>'minPrice' IS NULL 
      OR ps.price_per_night >= (filters->>'minPrice')::DECIMAL
    )
    AND (
      filters->>'maxPrice' IS NULL 
      OR ps.price_per_night <= (filters->>'maxPrice')::DECIMAL
    )
    AND (
      filters->>'propertyType' IS NULL 
      OR ps.property_type = filters->>'propertyType'
    )
    AND (
      filters->>'guests' IS NULL 
      OR ps.max_guests >= (filters->>'guests')::INTEGER
    )
    AND (
      filters->>'rooms' IS NULL 
      OR ps.bedrooms >= (filters->>'rooms')::INTEGER
    )
  ORDER BY rank DESC, ps.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON property_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_properties TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_property_stats TO service_role;

-- Add comments for documentation
COMMENT ON MATERIALIZED VIEW property_stats IS 'Materialized view containing property statistics for fast querying';
COMMENT ON FUNCTION search_properties IS 'Full-text search function for properties with filtering capabilities';
COMMENT ON FUNCTION refresh_property_stats IS 'Function to refresh the property_stats materialized view';
