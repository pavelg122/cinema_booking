export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          description: string
          poster_url: string
          banner_url: string
          duration: number
          release_date: string
          director: string
          cast_members: string[]
          genre: string[]
          rating: string
          imdb_rating: number
          trailer_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          poster_url: string
          banner_url: string
          duration: number
          release_date: string
          director: string
          cast_members: string[]
          genre: string[]
          rating: string
          imdb_rating: number
          trailer_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          poster_url?: string
          banner_url?: string
          duration?: number
          release_date?: string
          director?: string
          cast_members?: string[]
          genre?: string[]
          rating?: string
          imdb_rating?: number
          trailer_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      halls: {
        Row: {
          id: string
          name: string
          rows: number
          seats_per_row: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rows: number
          seats_per_row: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rows?: number
          seats_per_row?: number
          created_at?: string
          updated_at?: string
        }
      }
      seat_rows: {
        Row: {
          id: string
          hall_id: string
          row_letter: string
          created_at: string
        }
        Insert: {
          id?: string
          hall_id: string
          row_letter: string
          created_at?: string
        }
        Update: {
          id?: string
          hall_id?: string
          row_letter?: string
          created_at?: string
        }
      }
      seats: {
        Row: {
          id: string
          seat_row_id: string
          seat_number: number
          type: 'regular' | 'vip'
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          seat_row_id: string
          seat_number: number
          type: 'regular' | 'vip'
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          seat_row_id?: string
          seat_number?: number
          type?: 'regular' | 'vip'
          price?: number
          created_at?: string
        }
      }
      screenings: {
        Row: {
          id: string
          movie_id: string
          hall_id: string
          screening_date: string
          start_time: string
          end_time: string
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          movie_id: string
          hall_id: string
          screening_date: string
          start_time: string
          end_time: string
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          movie_id?: string
          hall_id?: string
          screening_date?: string
          start_time?: string
          end_time?: string
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          screening_id: string
          total_price: number
          booking_date: string
          status: 'pending' | 'confirmed' | 'cancelled'
          payment_method: string | null
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          screening_id: string
          total_price: number
          booking_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_method?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          screening_id?: string
          total_price?: number
          booking_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          payment_method?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booked_seats: {
        Row: {
          id: string
          booking_id: string
          seat_id: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          seat_id: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          seat_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      screening_occupancy: {
        Row: {
          screening_id: string | null
          movie_title: string | null
          hall_name: string | null
          screening_date: string | null
          start_time: string | null
          booked_seats: number | null
          total_seats: number | null
          occupancy_percentage: number | null
        }
      }
      popular_movies: {
        Row: {
          id: string | null
          title: string | null
          booking_count: number | null
          total_tickets_sold: number | null
        }
      }
    }
    Functions: {
      hash_password: {
        Args: { password: string }
        Returns: string
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
    }
  }
}