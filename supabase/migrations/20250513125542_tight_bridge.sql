/*
  # Connect Users and Roles Tables

  1. Changes
    - Add foreign key constraint between users and roles tables
    - Enable RLS on roles table
    - Add policies for roles and users tables

  2. Security
    - Enable RLS for roles table
    - Add policy for authenticated users to view roles
    - Update user policies for data access
*/

-- Add foreign key constraint to users table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_fkey'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_role_fkey
    FOREIGN KEY (role) REFERENCES roles (name)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
  END IF;
END $$;

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON roles;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Add policies for roles table
CREATE POLICY "Roles are viewable by authenticated users"
ON roles
FOR SELECT
TO authenticated
USING (true);

-- Update users table policies
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);