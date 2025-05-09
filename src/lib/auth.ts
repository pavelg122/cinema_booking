import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];

export const auth = {
  async login(email: string, password: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!user) throw new Error('User not found');

      // In a real app, we would verify the password hash here
      // For demo purposes, we'll do a simple comparison
      if (user.password_hash !== password) {
        throw new Error('Invalid password');
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash: password, // In a real app, this would be hashed
          role: 'user'
        })
        .select()
        .single();

      if (error) throw error;
      return user;
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
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};