-- Complete rooms data for all 23 properties - PART 1 (Uttarakhand Properties 1-9)
-- Room distribution based on bedroom count:
-- 1-3 rooms: All Deluxe (base_price)
-- 4 rooms: 2 Deluxe + 2 Super Deluxe (base_price + 50%)
-- 5 rooms: 2 Deluxe + 2 Super Deluxe + 1 Family Suite (base_price + 90%)
-- 6 rooms: 2 Deluxe + 2 Super Deluxe + 2 Family Suite
-- 7 rooms: 2 Deluxe + 2 Super Deluxe + 3 Family Suite

-- 1. The Turtle Huts (4 bedrooms) - 2 Deluxe + 2 Super Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Turtle Huts'), 'Deluxe Riverside Hut 1', 'Deluxe', 2, 4500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Turtle%20Huts/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Turtle Huts'), 'Deluxe Riverside Hut 2', 'Deluxe', 2, 4500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Turtle%20Huts/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Turtle Huts'), 'Super Deluxe Riverside Hut 1', 'Super Deluxe', 2, 6750, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Turtle%20Huts/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Turtle Huts'), 'Super Deluxe Riverside Hut 2', 'Super Deluxe', 2, 6750, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Turtle%20Huts/room4.webp', NULL, true, NOW(), NOW());

-- 2. Keekoo Stays (5 bedrooms) - 2 Deluxe + 2 Super Deluxe + 1 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Keekoo Stays'), 'Deluxe Mountain View 1', 'Deluxe', 2, 9000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Keekoo%20Stays/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Keekoo Stays'), 'Deluxe Mountain View 2', 'Deluxe', 2, 9000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Keekoo%20Stays/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Keekoo Stays'), 'Super Deluxe Mountain View 1', 'Super Deluxe', 2, 13500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Keekoo%20Stays/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Keekoo Stays'), 'Super Deluxe Mountain View 2', 'Super Deluxe', 2, 13500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Keekoo%20Stays/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Keekoo Stays'), 'Family Suite Mountain View', 'Family Suite', 4, 17100, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Keekoo%20Stays/room5.webp', NULL, true, NOW(), NOW());

-- 3. Sundays Forever Kings Cottage (2 bedrooms) - 2 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Sundays Forever Kings Cottage'), 'Deluxe Royal Room 1', 'Deluxe', 2, 15000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Sundays%20Forever%20Kings%20Cottage/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Sundays Forever Kings Cottage'), 'Deluxe Royal Room 2', 'Deluxe', 2, 15000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Sundays%20Forever%20Kings%20Cottage/room2.webp', NULL, true, NOW(), NOW());

-- 4. Annfield Cottage (7 bedrooms) - 2 Deluxe + 2 Super Deluxe + 3 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Deluxe Heritage Room 1', 'Deluxe', 2, 6000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Deluxe Heritage Room 2', 'Deluxe', 2, 6000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Super Deluxe Heritage Room 1', 'Super Deluxe', 2, 9000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Super Deluxe Heritage Room 2', 'Super Deluxe', 2, 9000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Family Suite Heritage Room 1', 'Family Suite', 4, 11400, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room5.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Family Suite Heritage Room 2', 'Family Suite', 4, 11400, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room6.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Annfield Cottage'), 'Family Suite Heritage Room 3', 'Family Suite', 4, 11400, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Annfield%20Cottage/room7.webp', NULL, true, NOW(), NOW());

-- 5. Jharipani Castle (7 bedrooms) - 2 Deluxe + 2 Super Deluxe + 3 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Deluxe Castle Room 1', 'Deluxe', 2, 4000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Deluxe Castle Room 2', 'Deluxe', 2, 4000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Super Deluxe Castle Room 1', 'Super Deluxe', 2, 6000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Super Deluxe Castle Room 2', 'Super Deluxe', 2, 6000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Family Suite Castle Room 1', 'Family Suite', 4, 7600, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room5.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Family Suite Castle Room 2', 'Family Suite', 4, 7600, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room6.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Jharipani Castle'), 'Family Suite Castle Room 3', 'Family Suite', 4, 7600, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Jharipani%20Castle/room7.webp', NULL, true, NOW(), NOW());

-- 6. The Lanswood Estate (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Lanswood Estate'), 'Deluxe Forest Room 1', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Lanswood%20Estate/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Lanswood Estate'), 'Deluxe Forest Room 2', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Lanswood%20Estate/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Lanswood Estate'), 'Deluxe Forest Room 3', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Lanswood%20Estate/room3.webp', NULL, true, NOW(), NOW());

-- 7. Karinya Villas (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Karinya Villas'), 'Deluxe Lake View Villa 1', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Karinya%20Villas/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Karinya Villas'), 'Deluxe Lake View Villa 2', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Karinya%20Villas/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Karinya Villas'), 'Deluxe Lake View Villa 3', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Karinya%20Villas/room3.webp', NULL, true, NOW(), NOW());

-- 8. Castle Glamp (6 bedrooms) - 2 Deluxe + 2 Super Deluxe + 2 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Castle Glamp'), 'Deluxe Glamp Tent 1', 'Deluxe', 2, 9000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Castle%20Glamp/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Castle Glamp'), 'Deluxe Glamp Tent 2', 'Deluxe', 2, 9000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Castle%20Glamp/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Castle Glamp'), 'Super Deluxe Glamp Tent 1', 'Super Deluxe', 2, 13500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Castle%20Glamp/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Castle Glamp'), 'Super Deluxe Glamp Tent 2', 'Super Deluxe', 2, 13500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Castle%20Glamp/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Castle Glamp'), 'Family Suite Glamp Tent 1', 'Family Suite', 4, 17100, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Castle%20Glamp/room5.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Castle Glamp'), 'Family Suite Glamp Tent 2', 'Family Suite', 4, 17100, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Castle%20Glamp/room6.webp', NULL, true, NOW(), NOW());

-- 9. Moustache Select Mukteshwar (5 bedrooms) - 2 Deluxe + 2 Super Deluxe + 1 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Moustache Select Mukteshwar'), 'Deluxe Orchard Room 1', 'Deluxe', 2, 4000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Moustache%20Select%20Mukteshwar/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Moustache Select Mukteshwar'), 'Deluxe Orchard Room 2', 'Deluxe', 2, 4000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Moustache%20Select%20Mukteshwar/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Moustache Select Mukteshwar'), 'Super Deluxe Orchard Room 1', 'Super Deluxe', 2, 6000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Moustache%20Select%20Mukteshwar/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Moustache Select Mukteshwar'), 'Super Deluxe Orchard Room 2', 'Super Deluxe', 2, 6000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Moustache%20Select%20Mukteshwar/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Moustache Select Mukteshwar'), 'Family Suite Orchard Room', 'Family Suite', 4, 7600, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Moustache%20Select%20Mukteshwar/room5.webp', NULL, true, NOW(), NOW());
-- Complete rooms data for all 23 properties - PART 2 (Himachal Properties 10-16)
-- Room distribution based on bedroom count:
-- 1-3 rooms: All Deluxe (base_price)
-- 4 rooms: 2 Deluxe + 2 Super Deluxe (base_price + 50%)
-- 5 rooms: 2 Deluxe + 2 Super Deluxe + 1 Family Suite (base_price + 90%)
-- 6 rooms: 2 Deluxe + 2 Super Deluxe + 2 Family Suite
-- 7 rooms: 2 Deluxe + 2 Super Deluxe + 3 Family Suite

-- 10. Kasauli Pebbles (5 bedrooms) - 2 Deluxe + 2 Super Deluxe + 1 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Kasauli Pebbles'), 'Deluxe Stone Room 1', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Kasauli%20Pebbles/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Kasauli Pebbles'), 'Deluxe Stone Room 2', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Kasauli%20Pebbles/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Kasauli Pebbles'), 'Super Deluxe Stone Room 1', 'Super Deluxe', 2, 4500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Kasauli%20Pebbles/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Kasauli Pebbles'), 'Super Deluxe Stone Room 2', 'Super Deluxe', 2, 4500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Kasauli%20Pebbles/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Kasauli Pebbles'), 'Family Suite Stone Room', 'Family Suite', 4, 5700, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Kasauli%20Pebbles/room5.webp', NULL, true, NOW(), NOW());

-- 11. LivingStone Ojuven Resort (2 bedrooms) - 2 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'LivingStone Ojuven Resort'), 'Deluxe Family Room 1', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/LivingStone%20Ojuven%20Resort/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'LivingStone Ojuven Resort'), 'Deluxe Family Room 2', 'Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/LivingStone%20Ojuven%20Resort/room2.webp', NULL, true, NOW(), NOW());

-- 12. Monkey Mud House and Glamps (4 bedrooms) - 2 Deluxe + 2 Super Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Monkey Mud House and Glamps'), 'Deluxe Mud House 1', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Monkey%20Mud%20House%20and%20Glamps/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Monkey Mud House and Glamps'), 'Deluxe Mud House 2', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Monkey%20Mud%20House%20and%20Glamps/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Monkey Mud House and Glamps'), 'Super Deluxe Glamp Tent 1', 'Super Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Monkey%20Mud%20House%20and%20Glamps/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Monkey Mud House and Glamps'), 'Super Deluxe Glamp Tent 2', 'Super Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Monkey%20Mud%20House%20and%20Glamps/room4.webp', NULL, true, NOW(), NOW());

-- 13. Mountain Bliss Homestay (5 bedrooms) - 2 Deluxe + 2 Super Deluxe + 1 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mountain Bliss Homestay'), 'Deluxe Alpine Room 1', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mountain%20Bliss%20Homestay/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mountain Bliss Homestay'), 'Deluxe Alpine Room 2', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mountain%20Bliss%20Homestay/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mountain Bliss Homestay'), 'Super Deluxe Alpine Room 1', 'Super Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mountain%20Bliss%20Homestay/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mountain Bliss Homestay'), 'Super Deluxe Alpine Room 2', 'Super Deluxe', 2, 3000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mountain%20Bliss%20Homestay/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mountain Bliss Homestay'), 'Family Suite Alpine Room', 'Family Suite', 4, 3800, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mountain%20Bliss%20Homestay/room5.webp', NULL, true, NOW(), NOW());

-- 14. Iris Cottage Dalhousie (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Iris Cottage Dalhousie'), 'Deluxe Victorian Room 1', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Iris%20Cottage%20Dalhousie/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Iris Cottage Dalhousie'), 'Deluxe Victorian Room 2', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Iris%20Cottage%20Dalhousie/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Iris Cottage Dalhousie'), 'Deluxe Victorian Room 3', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Iris%20Cottage%20Dalhousie/room3.webp', NULL, true, NOW(), NOW());

-- 15. Naddi Castle Homestay (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Naddi Castle Homestay'), 'Deluxe Castle Room 1', 'Deluxe', 2, 7000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Naddi%20Castle%20Homestay/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Naddi Castle Homestay'), 'Deluxe Castle Room 2', 'Deluxe', 2, 7000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Naddi%20Castle%20Homestay/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Naddi Castle Homestay'), 'Deluxe Castle Room 3', 'Deluxe', 2, 7000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Naddi%20Castle%20Homestay/room3.webp', NULL, true, NOW(), NOW());

-- 16. Winterfell The Stay (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Winterfell The Stay'), 'Deluxe Nordic Room 1', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Winterfell%20The%20Stay/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Winterfell The Stay'), 'Deluxe Nordic Room 2', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Winterfell%20The%20Stay/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Winterfell The Stay'), 'Deluxe Nordic Room 3', 'Deluxe', 2, 2000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Winterfell%20The%20Stay/room3.webp', NULL, true, NOW(), NOW());
-- Complete rooms data for all 23 properties - PART 3 (Kashmir & North East Properties 17-23)
-- Room distribution based on bedroom count:
-- 1-3 rooms: All Deluxe (base_price)
-- 4 rooms: 2 Deluxe + 2 Super Deluxe (base_price + 50%)
-- 5 rooms: 2 Deluxe + 2 Super Deluxe + 1 Family Suite (base_price + 90%)
-- 6 rooms: 2 Deluxe + 2 Super Deluxe + 2 Family Suite
-- 7 rooms: 2 Deluxe + 2 Super Deluxe + 3 Family Suite

-- 17. Zabarwan Peaks Villa (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Zabarwan Peaks Villa'), 'Deluxe Kashmiri Room 1', 'Deluxe', 2, 3500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Zabarwan%20Peaks%20Villa/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Zabarwan Peaks Villa'), 'Deluxe Kashmiri Room 2', 'Deluxe', 2, 3500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Zabarwan%20Peaks%20Villa/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Zabarwan Peaks Villa'), 'Deluxe Kashmiri Room 3', 'Deluxe', 2, 3500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Zabarwan%20Peaks%20Villa/room3.webp', NULL, true, NOW(), NOW());

-- 18. Desert Blue Pangong (5 bedrooms) - 2 Deluxe + 2 Super Deluxe + 1 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Desert Blue Pangong'), 'Deluxe Lakefront Tent 1', 'Deluxe', 2, 12000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Desert%20Blue%20Pangong/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Desert Blue Pangong'), 'Deluxe Lakefront Tent 2', 'Deluxe', 2, 12000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Desert%20Blue%20Pangong/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Desert Blue Pangong'), 'Super Deluxe Lakefront Tent 1', 'Super Deluxe', 2, 18000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Desert%20Blue%20Pangong/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Desert Blue Pangong'), 'Super Deluxe Lakefront Tent 2', 'Super Deluxe', 2, 18000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Desert%20Blue%20Pangong/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Desert Blue Pangong'), 'Family Suite Lakefront Tent', 'Family Suite', 4, 22800, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Desert%20Blue%20Pangong/room5.webp', NULL, true, NOW(), NOW());

-- 19. The Alpine Jungle Stay (4 bedrooms) - 2 Deluxe + 2 Super Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Alpine Jungle Stay'), 'Deluxe Jungle Room 1', 'Deluxe', 2, 3500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Alpine%20Jungle%20Stay/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Alpine Jungle Stay'), 'Deluxe Jungle Room 2', 'Deluxe', 2, 3500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Alpine%20Jungle%20Stay/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Alpine Jungle Stay'), 'Super Deluxe Jungle Room 1', 'Super Deluxe', 2, 5250, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Alpine%20Jungle%20Stay/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Alpine Jungle Stay'), 'Super Deluxe Jungle Room 2', 'Super Deluxe', 2, 5250, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Alpine%20Jungle%20Stay/room4.webp', NULL, true, NOW(), NOW());

-- 20. The Firefly Eco Luxury Retreat (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Firefly Eco Luxury Retreat'), 'Deluxe Eco Villa 1', 'Deluxe', 2, 23000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Firefly%20Eco%20Luxury%20Retreat/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Firefly Eco Luxury Retreat'), 'Deluxe Eco Villa 2', 'Deluxe', 2, 23000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Firefly%20Eco%20Luxury%20Retreat/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'The Firefly Eco Luxury Retreat'), 'Deluxe Eco Villa 3', 'Deluxe', 2, 23000, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/The%20Firefly%20Eco%20Luxury%20Retreat/room3.webp', NULL, true, NOW(), NOW());

-- 21. Bellevue Homestay Shillong (5 bedrooms) - 2 Deluxe + 2 Super Deluxe + 1 Family Suite
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Bellevue Homestay Shillong'), 'Deluxe Heritage Room 1', 'Deluxe', 2, 1500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Bellevue%20Homestay%20Shillong/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Bellevue Homestay Shillong'), 'Deluxe Heritage Room 2', 'Deluxe', 2, 1500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Bellevue%20Homestay%20Shillong/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Bellevue Homestay Shillong'), 'Super Deluxe Heritage Room 1', 'Super Deluxe', 2, 2250, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Bellevue%20Homestay%20Shillong/room3.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Bellevue Homestay Shillong'), 'Super Deluxe Heritage Room 2', 'Super Deluxe', 2, 2250, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Bellevue%20Homestay%20Shillong/room4.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Bellevue Homestay Shillong'), 'Family Suite Heritage Room', 'Family Suite', 4, 2850, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Bellevue%20Homestay%20Shillong/room5.webp', NULL, true, NOW(), NOW());

-- 22. Adlai Homestay (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Adlai Homestay'), 'Deluxe Tribal Room 1', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Adlai%20Homestay/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Adlai Homestay'), 'Deluxe Tribal Room 2', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Adlai%20Homestay/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Adlai Homestay'), 'Deluxe Tribal Room 3', 'Deluxe', 2, 7500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Adlai%20Homestay/room3.webp', NULL, true, NOW(), NOW());

-- 23. Mishmi Takin Homestay (3 bedrooms) - 3 Deluxe
INSERT INTO public.rooms (id, property_id, name, room_type, max_guests, base_price, amenities, cover_image, gallery, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mishmi Takin Homestay'), 'Deluxe Hillside Room 1', 'Deluxe', 2, 1500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mishmi%20Takin%20Homestay/room1.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mishmi Takin Homestay'), 'Deluxe Hillside Room 2', 'Deluxe', 2, 1500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mishmi%20Takin%20Homestay/room2.webp', NULL, true, NOW(), NOW()),
(gen_random_uuid(), (SELECT id FROM public.properties WHERE title = 'Mishmi Takin Homestay'), 'Deluxe Hillside Room 3', 'Deluxe', 2, 1500, NULL, 'https://qfpfezjygemxfgwazsix.supabase.co/storage/v1/object/public/property-images/Mishmi%20Takin%20Homestay/room3.webp', NULL, true, NOW(), NOW());
