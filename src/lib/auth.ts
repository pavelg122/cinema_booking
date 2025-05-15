import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];

export const auth = {
  async login(email: string, password: string) {
    try {
      // First authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed');

      // Get the user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            name
          )
        `)
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;
      if (!user) throw new Error('User not found');

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
      // First sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // Hash password using database function
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password });

      if (hashError) throw hashError;

      // Create user record
      const { data: user, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
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
        return null;
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
  },

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};