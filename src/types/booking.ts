export interface Seat {
  id: string;
  row: string;
  number: number;
}

export interface Booking {
  id: string;
  userId: string;
  screeningId: string;
  movieId: string;
  seats: Seat[];
  totalPrice: number;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod?: string;
  paymentId?: string;
}