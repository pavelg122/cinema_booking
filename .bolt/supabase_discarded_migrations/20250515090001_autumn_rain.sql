/*
  # Update payment and booking relationship
  
  1. Changes
    - Remove payment_method column from bookings table
    - Add payment_id column to bookings table
    - Update foreign key constraints
  
  2. Security
    - Update RLS policies to reflect new relationship
*/

-- Remove payment_method column from bookings
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS payment_method;

-- Ensure payment_id column exists and has correct foreign key
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_payment_id_fkey;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id);

-- Update RLS policies
CREATE OR REPLACE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE POLICY "Users can create their own payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);