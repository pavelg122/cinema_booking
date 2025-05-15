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
    console.log('Fetching movies...');
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('release_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }

    console.log('Movies fetched:', data);
    return data || [];
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
    console.log('Fetching popular movies...');
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('imdb_rating', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }

    console.log('Popular movies fetched:', data);
    return data || [];
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
    // First get the screening to get the hall_id
    const { data: screening, error: screeningError } = await supabase
      .from('screenings')
      .select('hall_id')
      .eq('id', screeningId)
      .single();
    
    if (screeningError) throw screeningError;

    // Get all seat rows and seats for the hall
    const { data: seatRows, error: seatRowsError } = await supabase
      .from('seat_rows')
      .select(`
        *,
        seats (*)
      `)
      .eq('hall_id', screening.hall_id)
      .order('row_letter');
    
    if (seatRowsError) throw seatRowsError;

    // Get all bookings for this screening
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('screening_id', screeningId)
      .in('status', ['confirmed', 'pending']);

    if (bookingsError) throw bookingsError;

    // If there are bookings, get all booked seats
    let bookedSeatIds: Set<string> = new Set();
    
    if (bookings && bookings.length > 0) {
      const { data: bookedSeats, error: bookedSeatsError } = await supabase
        .from('booked_seats')
        .select('seat_id')
        .in('booking_id', bookings.map(b => b.id));
      
      if (bookedSeatsError) throw bookedSeatsError;
      
      bookedSeatIds = new Set(bookedSeats?.map(bs => bs.seat_id) || []);
    }

    // Transform the data into the expected format
    return seatRows?.map(row => ({
      row: row.row_letter,
      seats: row.seats.map(seat => ({
        id: seat.id,
        row: row.row_letter,
        number: seat.seat_number,
        type: seat.type,
        status: bookedSeatIds.has(seat.id) ? 'occupied' : 'available',
        price: seat.price
      }))
    })) || [];
  },

  // Bookings
  async createBooking(userId: string, screeningId: string, seatIds: string[], totalPrice: number) {
    try {
      // Start a transaction
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          screening_id: screeningId,
          total_price: totalPrice,
          status: 'pending',
          booking_date: new Date().toISOString(),
          payment_method: 'credit_card',
          payment_id: `temp_${Date.now()}`
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        throw bookingError;
      }

      if (!booking) {
        throw new Error('No booking returned after creation');
      }

      // Insert booked seats
      const bookedSeats = seatIds.map(seatId => ({
        booking_id: booking.id,
        seat_id: seatId
      }));

      const { error: seatsError } = await supabase
        .from('booked_seats')
        .insert(bookedSeats);

      if (seatsError) {
        // If there's an error inserting seats, delete the booking
        await supabase
          .from('bookings')
          .delete()
          .eq('id', booking.id);
        throw seatsError;
      }

      return booking;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
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