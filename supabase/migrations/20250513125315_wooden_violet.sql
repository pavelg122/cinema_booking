/*
  # Update authentication schema
  
  1. Changes
    - Add foreign key constraint from users to roles
    - Add RLS policies for roles table
    - Update users table policies
    
  2. Security
    - Enable RLS on roles table
    - Add policies for role access
*/

-- Add foreign key constraint to users table
ALTER TABLE users
ADD CONSTRAINT users_role_fkey
FOREIGN KEY (role) REFERENCES roles (name)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

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