/*
  # Add payments table and update bookings schema
  
  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references public.users)
      - `amount` (numeric)
      - `status` (text)
      - `provider` (text)
      - `provider_payment_id` (text)
      - `created_at` (timestamptz)

  2. Changes
    - Add payment_id column to bookings table
    - Add foreign key constraint to payments table

  3. Security
    - Enable RLS on payments table
    - Add policies for authenticated users
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL,
  provider text,
  provider_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Add payment_id to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES public.payments(id);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);