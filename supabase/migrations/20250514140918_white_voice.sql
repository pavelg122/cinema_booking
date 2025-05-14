-- Create function to create admin users
CREATE OR REPLACE FUNCTION public.create_admin_user(
    name text,
    email text,
    password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant execute to authenticated users who are admins
CREATE POLICY "Admins can create admin users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM roles r
        JOIN users u ON u.role = r.name
        WHERE u.id = auth.uid()
        AND r.name = 'admin'::user_role
    )
    AND NEW.role = 'admin'::user_role
);