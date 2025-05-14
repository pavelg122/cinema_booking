/*
  # Fix user registration by adding necessary RLS policies
  
  1. Security Changes
    - Add policy to allow user registration
    - Add policy to allow public access to roles table
*/

-- Enable insert policy for users table
CREATE POLICY "Enable user registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Add policy for public role access
CREATE POLICY "Allow public role access"
ON public.roles
FOR SELECT
TO public
USING (true);