-- Setup script for Experiences and Trips with sample data
-- Run this script in your Supabase SQL editor

-- Clear existing data
DELETE FROM experiences;
DELETE FROM trips;

-- Add sample experiences data
INSERT INTO experiences (id, title, location, description, image, price, created_at, updated_at) VALUES
('b3b1c2d4-1234-4a1b-9abc-111111111111', 'Sunrise Mountain Hike', 'Manali, Himachal Pradesh', 'Start your day with a guided sunrise trek and breathtaking views of the Himalayas.', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', 1200, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-222222222222', 'Local Food Tasting Tour', 'Jaipur, Rajasthan', 'Sample the best of Rajasthani cuisine with a local expert.', 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80', 900, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-333333333333', 'Pottery Workshop', 'Pune, Maharashtra', 'Get your hands dirty and create your own pottery masterpiece.', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80', 700, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-444444444444', 'Old City Heritage Walk', 'Varanasi, Uttar Pradesh', 'Explore the hidden gems and stories of the ancient city.', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80', 500, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-555555555555', 'Yoga by the Ganges', 'Rishikesh, Uttarakhand', 'Experience the spiritual energy of Rishikesh with a sunrise yoga session.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80', 800, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-666666666666', 'Spice Garden Tour', 'Munnar, Kerala', 'Discover the aromatic world of spices in the lush hills of Munnar.', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80', 600, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-777777777777', 'Desert Safari', 'Jaisalmer, Rajasthan', 'Experience the thrill of a desert safari on camelback.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', 1500, NOW(), NOW()),
('b3b1c2d4-1234-4a1b-9abc-888888888888', 'Traditional Dance Performance', 'Udaipur, Rajasthan', 'Witness the grace and beauty of traditional Rajasthani dance forms.', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', 400, NOW(), NOW());

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

-- Verify the data was inserted successfully
SELECT 'Experiences' as table_name, COUNT(*) as count FROM experiences
UNION ALL
SELECT 'Trips' as table_name, COUNT(*) as count FROM trips; 