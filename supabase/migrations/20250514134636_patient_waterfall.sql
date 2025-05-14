/*
  # Fix users and roles relationships
  
  1. Changes
    - Add foreign key constraint between users and roles tables
    - Enable RLS on roles table
    - Add policies for roles and users tables
    
  2. Security
    - Enable RLS on roles table
    - Add policy for authenticated users to view roles
    - Add policies for users to manage their own data
*/

-- Add foreign key constraint to users table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_fkey' AND conrelid = 'users'::regclass) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_role_fkey
    FOREIGN KEY (role) REFERENCES roles (name)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
  END IF;
END $$;

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Add policies for roles table if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Roles are viewable by authenticated users' AND polrelid = 'roles'::regclass) THEN
    CREATE POLICY "Roles are viewable by authenticated users"
    ON roles
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Update users table policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can read own data' AND polrelid = 'users'::regclass) THEN
    CREATE POLICY "Users can read own data"
    ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own data' AND polrelid = 'users'::regclass) THEN
    CREATE POLICY "Users can update own data"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;