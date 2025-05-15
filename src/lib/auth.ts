import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];

export const auth = {
  async login(email: string, password: string) {
    try {
      // First get the user to check if they exist
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            name
          )
        `)
        .eq('email', email)
        .single();

      if (userError) throw userError;
      if (!user) throw new Error('User not found');

      // Verify password using database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          password,
          password_hash: user.password_hash
        });

      if (verifyError) throw verifyError;
      if (!isValid) throw new Error('Invalid password');

      return {
        ...user,
        role: user.roles?.name || 'user'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password using database function
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password });

      if (hashError) throw hashError;
       console.log({ name, email, password_hash: hashedPassword, role: 'user' });
      // Create new user with hashed password
      const { data: user, error: insertError } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash: hashedPassword,
          role: 'user'
        })
        .select(`
          *,
          roles (
            name
          )
        `)
        .single();

      if (insertError) throw insertError;
      if (!user) throw new Error('Failed to create user');

      return {
        ...user,
        role: user.roles?.name || 'user'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user?.id) {
        return null; // No user logged in
      }

      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            name
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      return {
        ...user,
        role: user.roles?.name || 'user'
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};