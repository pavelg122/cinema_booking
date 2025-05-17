import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type Movie = Database['public']['Tables']['movies']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Hall = Database['public']['Tables']['halls']['Row'];
type Seat = Database['public']['Tables']['seats']['Row'];
type SeatRow = Database['public']['Tables']['seat_rows']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

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

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('screening_id', screeningId)
      .in('status', ['confirmed', 'pending']);

    if (bookingsError) throw bookingsError;

    let bookedSeatIds: Set<string> = new Set();
    
    if (bookings && bookings.length > 0) {
      const { data: bookedSeats, error: bookedSeatsError } = await supabase
        .from('booked_seats')
        .select('seat_id')
        .in('booking_id', bookings.map(b => b.id));
      
      if (bookedSeatsError) throw bookedSeatsError;
      
      bookedSeatIds = new Set(bookedSeats?.map(bs => bs.seat_id) || []);
    }

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

  async reserveSeats(screeningId: string, seats: { id: string }[]) {
    const { data, error } = await supabase
      .rpc('reserve_seats', {
        p_screening_id: screeningId,
        p_seat_ids: seats.map(s => s.id)
      });

    if (error) throw error;
    return data;
  },

  async updateSeatReservation(reservationId: string) {
    const { error } = await supabase
      .rpc('update_seat_reservation', {
        p_reservation_id: reservationId
      });

    if (error) throw error;
  },

  async cancelSeatReservation(reservationId: string) {
    const { error } = await supabase
      .rpc('cancel_seat_reservation', {
        p_reservation_id: reservationId
      });

    if (error) throw error;
  },

  // Payments
  async createPayment(userId: string, amount: number, paymentIntentId: string | null, status: string = 'pending'): Promise<Payment> {
    // First verify that the user exists in public.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found in public.users table');
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount,
        status,
        provider: 'stripe',
        provider_payment_id: paymentIntentId
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No payment data returned');
    return data;
  },

  async updatePayment(paymentId: string, paymentIntentId: string, status: string = 'completed'): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status,
        provider_payment_id: paymentIntentId
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No payment data returned');
    return data;
  },

  // Bookings
  async createBooking(
    userId: string,
    screeningId: string,
    seatIds: string[],
    totalPrice: number,
    paymentId: string
  ) {
    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          screening_id: screeningId,
          total_price: totalPrice,
          status: 'pending',
          payment_id: paymentId,
          booking_date: new Date().toISOString()
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

      const bookedSeats = seatIds.map(seatId => ({
        booking_id: booking.id,
        seat_id: seatId
      }));

      const { error: seatsError } = await supabase
        .from('booked_seats')
        .insert(bookedSeats);

      if (seatsError) {
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

  async updateBookingStatus(bookingId: string, status: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
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
        ),
        payments (*)
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

  // Checkout
  async createCheckoutSession({ bookingId, paymentId, amount }: { bookingId: string; paymentId: string; amount: number }) {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        bookingId,
        paymentId,
        amount
      }
    });

    if (error) throw error;
    return data;
  }
};