/*
  # Fix bookings RLS policies

  1. Security
    - Enable RLS on bookings table
    - Add policies for authenticated users to:
      - Create their own bookings
      - View their own bookings
      - Admins can view all bookings
*/

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;

-- Create policies for bookings
CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM roles r
    JOIN users u ON u.role = r.name
    WHERE u.id = auth.uid()
    AND r.name = 'admin'::user_role
  )
);

-- Enable RLS on booked_seats table
ALTER TABLE public.booked_seats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their booked seats" ON public.booked_seats;
DROP POLICY IF EXISTS "Users can create their booked seats" ON public.booked_seats;

-- Create policies for booked_seats
CREATE POLICY "Users can view their booked seats"
ON public.booked_seats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id
    AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their booked seats"
ON public.booked_seats
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.id = booking_id
    AND b.user_id = auth.uid()
  )
);