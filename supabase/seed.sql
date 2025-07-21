-- Insert sample properties for 5 destinations (expand as needed)
INSERT INTO public.properties (
  host_id,
  title,
  subtitle,
  description,
  property_type,
  address,
  city,
  state,
  country,
  postal_code,
  latitude,
  longitude,
  price_per_night,
  max_guests,
  bedrooms,
  bathrooms,
  amenities,
  images,
  gallery,
  usps,
  house_rules,
  cancellation_policy
) VALUES
-- Rishikesh
('00000000-0000-0000-0000-000000000001', 'Ganga View Boutique', 'Serene riverside stay', 'Boutique stay with Ganga view, yoga deck, and pure-veg meals.', 'Boutique', '1 Ghat Road', 'Rishikesh', 'Uttarakhand', 'India', '249201', 30.0869, 78.2676, 3500, 4, 2, 2, ARRAY['WiFi','Power Backup','Pure-Veg','Mountain View','Meals','Parking'], ARRAY['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'], '{"Living": ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800"]}', ARRAY['River view','Yoga deck','Organic meals'], 'No smoking. No parties.', 'Free cancellation up to 7 days.'),
('00000000-0000-0000-0000-000000000001', 'Forest Cottage', 'Tranquil forest retreat', 'Cottage in the woods with fireplace and pet friendly.', 'Cottage', '2 Forest Lane', 'Rishikesh', 'Uttarakhand', 'India', '249201', 30.0870, 78.2677, 4200, 6, 3, 2, ARRAY['WiFi','Geyser','Fireplace','Pet Friendly','Parking','Mountain View'], ARRAY['https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800'], '{"Outdoor": ["https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800"]}', ARRAY['Forest walks','Fireplace','Pet friendly'], 'No loud music.', '50% refund after 3 days.'),
('00000000-0000-0000-0000-000000000001', 'Homely Riverside', 'Family-friendly homestay', 'Homely stay with meals, pool, and clubhouse.', 'Homely', '3 Riverside', 'Rishikesh', 'Uttarakhand', 'India', '249201', 30.0871, 78.2678, 3000, 5, 2, 2, ARRAY['WiFi','Meals','Pool','Clubhouse','Parking'], ARRAY['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'], '{"Living": ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800"]}', ARRAY['Pool','Family meals','Clubhouse'], 'Check-in after 2pm.', 'Full refund up to 5 days.'),
('00000000-0000-0000-0000-000000000001', 'Off-Beat Ashram', 'Unique spiritual escape', 'Off-beat ashram with power backup, geyser, and pet friendly.', 'Off-Beat', '4 Ashram Road', 'Rishikesh', 'Uttarakhand', 'India', '249201', 30.0872, 78.2679, 5000, 3, 1, 1, ARRAY['Power Backup','Geyser','Pet Friendly','Parking','Mountain View'], ARRAY['https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800'], '{"Outdoor": ["https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800"]}', ARRAY['Spiritual vibe','Pet friendly','Power backup'], 'No alcohol.', 'Non-refundable.'),
('00000000-0000-0000-0000-000000000001', 'Boutique Lakeview', 'Lake-facing luxury', 'Boutique property with pool, meals, and pure-veg options.', 'Boutique', '5 Lake Road', 'Rishikesh', 'Uttarakhand', 'India', '249201', 30.0873, 78.2680, 6000, 4, 2, 2, ARRAY['WiFi','Pool','Meals','Pure-Veg','Parking','Mountain View'], ARRAY['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800'], '{"Living": ["https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800"]}', ARRAY['Lake view','Pool','Pure-veg'], 'No pets.', 'Free cancellation up to 7 days.'),
-- Repeat similar blocks for Landour, Mussoorie, Dhanaulti, Kanatal, Lansdowne, Jim Corbett, Nainital, Pangot, Mukteshwar, Almora, Kausani, Shimla, Kasauli, Dalhousie, Khajjiar, Bir Billing, McLeodganj, Manali, Nepal, Bhutan, Kashmir, Ladakh, Sikkim, Assam, Arunachal, Nagaland, Meghalaya
-- (For brevity, only Rishikesh is shown. Expand for all destinations as needed.)

-- Insert sample bookings
INSERT INTO public.bookings (
  property_id,
  guest_id,
  check_in_date,
  check_out_date,
  guests_count,
  total_price,
  status
) VALUES 
(
  (SELECT id FROM public.properties WHERE title = 'Luxury Beachfront Villa' LIMIT 1),
  '00000000-0000-0000-0000-000000000004',
  '2024-02-15',
  '2024-02-20',
  6,
  2250.00,
  'confirmed'
),
(
  (SELECT id FROM public.properties WHERE title = 'Cozy Mountain Cabin' LIMIT 1),
  '00000000-0000-0000-0000-000000000005',
  '2024-02-10',
  '2024-02-14',
  4,
  1120.00,
  'completed'
),
(
  (SELECT id FROM public.properties WHERE title = 'Modern Downtown Apartment' LIMIT 1),
  '00000000-0000-0000-0000-000000000006',
  '2024-02-25',
  '2024-02-28',
  2,
  540.00,
  'pending'
);

-- Insert sample reviews
INSERT INTO public.reviews (
  booking_id,
  property_id,
  guest_id,
  rating,
  comment
) VALUES 
(
  (SELECT id FROM public.bookings WHERE total_price = 1120.00 LIMIT 1),
  (SELECT id FROM public.properties WHERE title = 'Cozy Mountain Cabin' LIMIT 1),
  '00000000-0000-0000-0000-000000000005',
  5,
  'Absolutely amazing cabin! The views were breathtaking and the hot tub was perfect after a day of hiking. Highly recommend!'
),
(
  (SELECT id FROM public.bookings WHERE total_price = 2250.00 LIMIT 1),
  (SELECT id FROM public.properties WHERE title = 'Luxury Beachfront Villa' LIMIT 1),
  '00000000-0000-0000-0000-000000000004',
  4,
  'Beautiful villa with stunning ocean views. The pool was fantastic and the location was perfect. Would definitely stay again!'
); 