export interface Screening {
  id: string;
  movieId: string;
  date: string;
  startTime: string;
  endTime: string;
  hall: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
}

export interface SeatType {
  id: string;
  row: string;
  number: number;
  type: 'regular' | 'vip' | 'disabled';
  status: 'available' | 'selected' | 'occupied';
  price: number;
}

export interface SeatRow {
  row: string;
  seats: SeatType[];
}

export interface Hall {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  seatMap: SeatRow[];
}