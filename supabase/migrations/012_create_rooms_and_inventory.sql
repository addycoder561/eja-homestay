-- Create room-related tables and supporting structures if they don't exist

-- Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  total_inventory INTEGER NOT NULL DEFAULT 1,
  max_guests INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[],
  images TEXT[] NOT NULL DEFAULT '{}',
  extra_adult_price INTEGER,
  child_breakfast_price INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room inventory (per-date availability)
CREATE TABLE IF NOT EXISTS public.room_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (room_id, date)
);

-- Booking to rooms mapping (multi-room bookings)
CREATE TABLE IF NOT EXISTS public.booking_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_room_inventory_room_date ON public.room_inventory(room_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_booking_id ON public.booking_rooms(booking_id);

-- Enable RLS (guarded) and add permissive policies if missing
DO $$ BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER TABLE public.room_inventory ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER TABLE public.booking_rooms ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
END $$;

-- Policies (idempotent-ish via exception guards)
DO $$ BEGIN
  BEGIN
    CREATE POLICY "Anyone can view rooms for available properties" ON public.rooms
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.properties 
          WHERE properties.id = rooms.property_id 
            AND properties.is_available = true
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Hosts can manage rooms for their properties" ON public.rooms
      FOR ALL USING (
        auth.uid() IN (
          SELECT host_id FROM public.properties 
          WHERE properties.id = rooms.property_id
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Anyone can view room inventory for available properties" ON public.room_inventory
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.rooms 
          JOIN public.properties ON properties.id = rooms.property_id
          WHERE rooms.id = room_inventory.room_id 
            AND properties.is_available = true
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Hosts can manage room inventory for their properties" ON public.room_inventory
      FOR ALL USING (
        auth.uid() IN (
          SELECT host_id FROM public.properties 
          JOIN public.rooms ON rooms.property_id = properties.id
          WHERE rooms.id = room_inventory.room_id
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Anyone can view booking rooms" ON public.booking_rooms
      FOR SELECT USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Users can create booking rooms for their bookings" ON public.booking_rooms
      FOR INSERT WITH CHECK (
        auth.uid() IN (
          SELECT guest_id FROM public.bookings 
          WHERE bookings.id = booking_rooms.booking_id
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    CREATE POLICY "Users can update their own booking rooms" ON public.booking_rooms
      FOR UPDATE USING (
        auth.uid() IN (
          SELECT guest_id FROM public.bookings 
          WHERE bookings.id = booking_rooms.booking_id
        )
      );
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;


