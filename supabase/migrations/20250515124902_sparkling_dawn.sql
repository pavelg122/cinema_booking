/*
  # Add seat reservation system
  
  1. New Tables
    - `seat_reservations`
      - `id` (uuid, primary key)
      - `screening_id` (uuid, references screenings)
      - `seat_id` (uuid, references seats)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. New Functions
    - `reserve_seats`: Creates or updates seat reservations
    - `update_seat_reservation`: Extends reservation time
    - `cancel_seat_reservation`: Removes seat reservation
    - `cleanup_expired_reservations`: Removes expired reservations
*/

-- Create seat_reservations table
CREATE TABLE IF NOT EXISTS public.seat_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id uuid REFERENCES public.screenings(id) ON DELETE CASCADE,
  seat_id uuid REFERENCES public.seats(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(screening_id, seat_id)
);

-- Enable RLS
ALTER TABLE public.seat_reservations ENABLE ROW LEVEL SECURITY;

-- Create function to reserve seats
CREATE OR REPLACE FUNCTION public.reserve_seats(
  p_screening_id uuid,
  p_seat_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation_id uuid;
  v_seat_id uuid;
BEGIN
  -- Check if seats are available
  IF EXISTS (
    SELECT 1 FROM public.seat_reservations sr
    WHERE sr.screening_id = p_screening_id
    AND sr.seat_id = ANY(p_seat_ids)
    AND sr.expires_at > now()
  ) THEN
    RAISE EXCEPTION 'One or more seats are already reserved';
  END IF;

  -- Generate reservation ID
  v_reservation_id := gen_random_uuid();

  -- Create reservations
  FOREACH v_seat_id IN ARRAY p_seat_ids
  LOOP
    INSERT INTO public.seat_reservations (
      id,
      screening_id,
      seat_id,
      expires_at
    )
    VALUES (
      v_reservation_id,
      p_screening_id,
      v_seat_id,
      now() + interval '10 minutes'
    )
    ON CONFLICT (screening_id, seat_id) DO UPDATE
    SET expires_at = now() + interval '10 minutes';
  END LOOP;

  RETURN v_reservation_id;
END;
$$;

-- Create function to update reservation
CREATE OR REPLACE FUNCTION public.update_seat_reservation(
  p_reservation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.seat_reservations
  SET expires_at = now() + interval '10 minutes'
  WHERE id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or expired';
  END IF;
END;
$$;

-- Create function to cancel reservation
CREATE OR REPLACE FUNCTION public.cancel_seat_reservation(
  p_reservation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.seat_reservations
  WHERE id = p_reservation_id;
END;
$$;

-- Create function to cleanup expired reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.seat_reservations
  WHERE expires_at <= now();
END;
$$;

-- Create a trigger to cleanup expired reservations
CREATE OR REPLACE FUNCTION public.trigger_cleanup_expired_reservations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.cleanup_expired_reservations();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_expired_reservations
  BEFORE INSERT OR UPDATE ON public.seat_reservations
  EXECUTE FUNCTION public.trigger_cleanup_expired_reservations();

-- Add policies for seat_reservations
CREATE POLICY "Users can view their reservations"
  ON public.seat_reservations
  FOR SELECT
  TO authenticated
  USING (true);