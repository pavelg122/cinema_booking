import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type Movie = Database['public']['Tables']['movies']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type ScreeningOccupancy = Database['public']['Views']['screening_occupancy']['Row'];
type PopularMovie = Database['public']['Views']['popular_movies']['Row'];

export const api = {
  // Movies
  async getMovies() {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('release_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getMovie(id: string) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Screenings
  async getScreenings(movieId?: string) {
    let query = supabase
      .from('screenings')
      .select(`
        *,
        movies (*),
        halls (*)
      `)
      .gte('screening_date', new Date().toISOString().split('T')[0])
      .order('screening_date')
      .order('start_time');

    if (movieId) {
      query = query.eq('movie_id', movieId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getScreening(id: string) {
    const { data, error } = await supabase
      .from('screenings')
      .select(`
        *,
        movies (*),
        halls (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Bookings
  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        screenings (
          *,
          movies (*),
          halls (*)
        )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Reports
  async getScreeningOccupancy() {
    const { data, error } = await supabase
      .from('screening_occupancy')
      .select('*')
      .order('screening_date')
      .order('start_time');
    
    if (error) throw error;
    return data;
  },

  async getPopularMovies() {
    const { data, error } = await supabase
      .from('popular_movies')
      .select('*')
      .order('booking_count', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}; 