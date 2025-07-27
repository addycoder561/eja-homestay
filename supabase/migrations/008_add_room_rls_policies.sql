-- Enable RLS on rooms and room_inventory tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_inventory ENABLE ROW LEVEL SECURITY;

-- Rooms policies
CREATE POLICY "Anyone can view rooms for available properties" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = rooms.property_id 
      AND properties.is_available = true
    )
  );

CREATE POLICY "Hosts can manage rooms for their properties" ON rooms
  FOR ALL USING (
    auth.uid() IN (
      SELECT host_id FROM properties 
      WHERE properties.id = rooms.property_id
    )
  );

-- Room inventory policies
CREATE POLICY "Anyone can view room inventory for available properties" ON room_inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN properties ON properties.id = rooms.property_id
      WHERE rooms.id = room_inventory.room_id 
      AND properties.is_available = true
    )
  );

CREATE POLICY "Hosts can manage room inventory for their properties" ON room_inventory
  FOR ALL USING (
    auth.uid() IN (
      SELECT host_id FROM properties 
      JOIN rooms ON rooms.property_id = properties.id
      WHERE rooms.id = room_inventory.room_id
    )
  );

-- Booking rooms policies
CREATE POLICY "Anyone can view booking rooms" ON booking_rooms
  FOR SELECT USING (true);

CREATE POLICY "Users can create booking rooms for their bookings" ON booking_rooms
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT guest_id FROM bookings 
      WHERE bookings.id = booking_rooms.booking_id
    )
  );

CREATE POLICY "Users can update their own booking rooms" ON booking_rooms
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT guest_id FROM bookings 
      WHERE bookings.id = booking_rooms.booking_id
    )
  ); 