import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type Movie = Database['public']['Tables']['movies']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Hall = Database['public']['Tables']['halls']['Row'];
type Seat = Database['public']['Tables']['seats']['Row'];
type SeatRow = Database['public']['Tables']['seat_rows']['Row'];

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

  async getPopularMovies() {
    const { data, error } = await supabase
      .from('popular_movies')
      .select('*')
      .order('booking_count', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return data;
  },

  // Screenings
  async getScreenings(movieId?: string, date?: string) {
    let query = supabase
      .from('screenings')
      .select(`
        *,
        movies (*),
        halls (*)
      `)
      .order('screening_date')
      .order('start_time');

    if (date) {
      query = query.gte('screening_date', date);
    }

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

  // Halls
  async getHalls() {
    const { data, error } = await supabase
      .from('halls')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Seats
  async getSeatsForScreening(screeningId: string) {
    const { data: screening, error: screeningError } = await supabase
      .from('screenings')
      .select('hall_id')
      .eq('id', screeningId)
      .single();
    
    if (screeningError) throw screeningError;

    const { data: seatRows, error: seatRowsError } = await supabase
      .from('seat_rows')
      .select(`
        *,
        seats (*)
      `)
      .eq('hall_id', screening.hall_id)
      .order('row_letter');
    
    if (seatRowsError) throw seatRowsError;

    // Get booked seats for this screening
    const { data: bookedSeats, error: bookedSeatsError } = await supabase
      .from('booked_seats')
      .select('seat_id')
      .eq('screening_id', screeningId);
    
    if (bookedSeatsError) throw bookedSeatsError;

    const bookedSeatIds = new Set(bookedSeats.map(bs => bs.seat_id));

    // Transform the data into the expected format
    return seatRows.map(row => ({
      row: row.row_letter,
      seats: row.seats.map(seat => ({
        id: seat.id,
        row: row.row_letter,
        number: seat.seat_number,
        type: seat.type,
        status: bookedSeatIds.has(seat.id) ? 'occupied' : 'available',
        price: seat.price
      }))
    }));
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
  }
};