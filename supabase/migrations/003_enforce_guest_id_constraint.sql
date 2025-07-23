-- Make guest_id NOT NULL in bookings table
ALTER TABLE bookings
ALTER COLUMN guest_id SET NOT NULL;

-- Add a foreign key constraint to ensure guest_id references profiles(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'bookings_guest_id_fkey'
      AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_guest_id_fkey
    FOREIGN KEY (guest_id) REFERENCES profiles(id);
  END IF;
END $$; 