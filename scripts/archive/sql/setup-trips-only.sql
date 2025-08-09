-- Setup script for Trips only
-- Run this script in your Supabase SQL editor

-- Clear existing data
DELETE FROM trips;

-- Add sample trips data
INSERT INTO trips (id, title, location, description, image, price, duration, created_at, updated_at) VALUES
('b3b1c2d4-1234-4a1b-9abc-aaaaaaaabbbb', 'Golden Triangle Tour', 'Delhi, Agra, Jaipur', 'Experience the best of North India with this classic circuit.', 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', 8500, '5 Days / 4 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-bbbbbbbbcccc', 'Goa Beach Getaway', 'Goa', 'Relax on pristine beaches and enjoy vibrant nightlife.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', 6500, '4 Days / 3 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-ccccccccdddd', 'Kerala Backwaters', 'Alleppey, Kerala', 'Cruise through the tranquil backwaters on a traditional houseboat.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', 9000, '3 Days / 2 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-ddddddddaaaa', 'Himalayan Adventure', 'Leh, Ladakh', 'Thrilling road trip through the majestic Himalayas.', 'https://images.unsplash.com/photo-1464013778555-8e723c2f01f8?auto=format&fit=crop&w=800&q=80', 12000, '7 Days / 6 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-eeeeeeeeffff', 'Rajasthan Heritage Tour', 'Jaipur, Jodhpur, Udaipur', 'Explore the royal heritage of Rajasthan.', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80', 11000, '6 Days / 5 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-ffffffffgggg', 'South India Temple Trail', 'Chennai, Madurai, Rameshwaram', 'Discover the spiritual heritage of South India.', 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80', 7500, '5 Days / 4 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-gggggggghhhh', 'Northeast Discovery', 'Guwahati, Shillong, Kaziranga', 'Explore the unexplored beauty of Northeast India.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80', 9500, '6 Days / 5 Nights', NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-hhhhhhhhiiii', 'Mumbai to Goa Coastal Drive', 'Mumbai, Ratnagiri, Goa', 'Drive along the scenic Konkan coast.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', 8000, '4 Days / 3 Nights', NOW(), NOW());

-- Verify the data was inserted
SELECT COUNT(*) as trips_count FROM trips; 