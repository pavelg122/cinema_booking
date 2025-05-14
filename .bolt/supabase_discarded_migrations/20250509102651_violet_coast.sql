/*
  # Add password hashing function and update users table
  
  1. Changes
    - Add pgcrypto extension for cryptographic functions
    - Create hash_password function using pgcrypto
    - Rename password column to password_hash
    - Update RLS policies
*/

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create hash_password function
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$;

-- Rename password column to password_hash
ALTER TABLE public.users 
  RENAME COLUMN password TO password_hash;

-- Add function to verify password
CREATE OR REPLACE FUNCTION verify_password(password text, password_hash text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$;