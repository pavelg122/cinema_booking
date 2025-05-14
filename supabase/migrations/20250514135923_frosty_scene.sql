/*
  # Fix registration error

  1. Changes
    - Drop and recreate user registration policy with proper permissions
    - Ensure roles table has required initial data
    - Add proper RLS policies for roles table
*/

-- First ensure the roles table has the required roles
INSERT INTO roles (name)
VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enable user registration" ON public.users;
DROP POLICY IF EXISTS "Allow public role access" ON public.roles;

-- Create proper policies for user registration
CREATE POLICY "Enable user registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (
  -- Ensure role is 'user' for new registrations
  role = 'user'::user_role
);

-- Allow public access to roles (needed for registration)
CREATE POLICY "Allow public role access"
ON public.roles
FOR SELECT
TO public
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;