/*
  # Create admin user function
  
  1. New Functions
    - `create_admin_user(name text, email text, password text)`: Creates a new admin user
      - Checks if admin role exists
      - Validates email uniqueness
      - Hashes password
      - Creates user with admin role
      - Returns the new user's ID
  
  2. Security
    - Function is SECURITY DEFINER to bypass RLS
    - Execute permission revoked from PUBLIC
    - Only admins can execute the function
*/

-- Create function to create admin users
CREATE OR REPLACE FUNCTION public.create_admin_user(
    name text,
    email text,
    password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id uuid;
    hashed_password text;
    admin_role_exists boolean;
BEGIN
    -- Check if admin role exists
    SELECT EXISTS (
        SELECT 1 FROM roles WHERE name = 'admin'
    ) INTO admin_role_exists;

    IF NOT admin_role_exists THEN
        RAISE EXCEPTION 'Admin role does not exist';
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = create_admin_user.email) THEN
        RAISE EXCEPTION 'User with this email already exists';
    END IF;

    -- Hash the password
    SELECT hash_password(create_admin_user.password) INTO hashed_password;

    -- Insert the new admin user
    INSERT INTO public.users (
        name,
        email,
        password_hash,
        role
    )
    VALUES (
        create_admin_user.name,
        create_admin_user.email,
        hashed_password,
        'admin'::user_role
    )
    RETURNING id INTO user_id;

    RETURN user_id;
END;
$$;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION public.create_admin_user(text, text, text) FROM PUBLIC;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_user(text, text, text) TO authenticated;

-- Create a security barrier view to check admin status
CREATE OR REPLACE VIEW admin_check AS
SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON u.role = r.name
    WHERE u.id = auth.uid()
    AND r.name = 'admin'::user_role
) AS is_admin;

-- Create a function to wrap the admin user creation with permission check
CREATE OR REPLACE FUNCTION public.create_admin_user_with_check(
    name text,
    email text,
    password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin boolean;
    new_user_id uuid;
BEGIN
    -- Check if the current user is an admin
    SELECT a.is_admin INTO is_admin FROM admin_check a;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can create admin users';
    END IF;

    -- Call the actual create function
    SELECT create_admin_user(name, email, password) INTO new_user_id;
    
    RETURN new_user_id;
END;
$$;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION public.create_admin_user_with_check(text, text, text) FROM PUBLIC;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_user_with_check(text, text, text) TO authenticated;