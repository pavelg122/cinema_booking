import { Movie } from '../types/movie';
import { Screening, Hall, SeatRow, SeatType } from '../types/screening';
import { Booking } from '../types/booking';
import { format, addDays } from 'date-fns';

// Helper to generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock movies data
export const movies: Movie[] = [
  {
    id: 'movie1',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600',
    bannerUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: 148,
    releaseDate: '2010-07-16',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 'PG-13',
    imdbRating: 8.8,
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
  },
  {
    id: 'movie2',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.pexels.com/photos/10772413/pexels-photo-10772413.jpeg?auto=compress&cs=tinysrgb&w=600',
    bannerUrl: 'https://images.pexels.com/photos/10772413/pexels-photo-10772413.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: 152,
    releaseDate: '2008-07-18',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
    genre: ['Action', 'Crime', 'Drama'],
    rating: 'PG-13',
    imdbRating: 9.0,
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
  },
  {
    id: 'movie3',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterUrl: 'https://images.pexels.com/photos/6985003/pexels-photo-6985003.jpeg?auto=compress&cs=tinysrgb&w=600',
    bannerUrl: 'https://images.pexels.com/photos/6985003/pexels-photo-6985003.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: 169,
    releaseDate: '2014-11-07',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    rating: 'PG-13',
    imdbRating: 8.6,
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
  },
  {
    id: 'movie4',
    title: 'The Matrix',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterUrl: 'https://images.pexels.com/photos/5662857/pexels-photo-5662857.png?auto=compress&cs=tinysrgb&w=600',
    bannerUrl: 'https://images.pexels.com/photos/5662857/pexels-photo-5662857.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: 136,
    releaseDate: '1999-03-31',
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
    genre: ['Action', 'Sci-Fi'],
    rating: 'R',
    imdbRating: 8.7,
    trailerUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8',
  },
  {
    id: 'movie5',
    title: 'Avatar',
    description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
    posterUrl: 'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=600',
    bannerUrl: 'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: 162,
    releaseDate: '2009-12-18',
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
    genre: ['Action', 'Adventure', 'Fantasy'],
    rating: 'PG-13',
    imdbRating: 7.8,
    trailerUrl: 'https://www.youtube.com/embed/5PSNL1qE6VY',
  },
  {
    id: 'movie6',
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
    posterUrl: 'https://images.pexels.com/photos/7991160/pexels-photo-7991160.jpeg?auto=compress&cs=tinysrgb&w=600',
    bannerUrl: 'https://images.pexels.com/photos/7991160/pexels-photo-7991160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: 142,
    releaseDate: '1994-07-06',
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise', 'Sally Field'],
    genre: ['Drama', 'Romance'],
    rating: 'PG-13',
    imdbRating: 8.8,
    trailerUrl: 'https://www.youtube.com/embed/bLvqoHBptjg',
  },
];

// Generate hall with seats
const generateHall = (id: string, name: string, rows: number, seatsPerRow: number): Hall => {
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const seatMap: SeatRow[] = [];

  for (let i = 0; i < rows; i++) {
    const rowLetter = rowLetters[i];
    const seats: SeatType[] = [];

    for (let j = 1; j <= seatsPerRow; j++) {
      const seatType = j >= 3 && j <= seatsPerRow - 2 && i >= 2 && i <= rows - 3 ? 'vip' : 'regular';
      const seatId = `${rowLetter}${j}`;
      
      seats.push({
        id: seatId,
        row: rowLetter,
        number: j,
        type: seatType,
        status: 'available',
        price: seatType === 'vip' ? 15 : 10,
      });
    }

    seatMap.push({
      row: rowLetter,
      seats,
    });
  }

  return {
    id,
    name,
    rows,
    seatsPerRow,
    seatMap,
  };
};

// Generate halls
export const halls: Hall[] = [
  generateHall('hall1', 'Hall 1 - IMAX', 10, 16),
  generateHall('hall2', 'Hall 2', 8, 14),
  generateHall('hall3', 'Hall 3', 8, 12),
];

// Generate screenings for the next 7 days
export const generateScreenings = (): Screening[] => {
  const screenings: Screening[] = [];
  const startTimes = ['10:00', '13:00', '16:00', '19:00', '22:00'];
  
  movies.forEach(movie => {
    for (let day = 0; day < 7; day++) {
      const screeningDate = format(addDays(new Date(), day), 'yyyy-MM-dd');
      
      // Each movie shows in different halls on different days
      const hallIndex = (day % halls.length);
      const hall = halls[hallIndex];
      
      // Not all movies show at all times
      const timesToUse = startTimes.slice(0, 3 + (day % 3));
      
      timesToUse.forEach(startTime => {
        // Calculate end time based on movie duration
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = startTimeMinutes + movie.duration;
        const endHour = Math.floor(endTimeMinutes / 60);
        const endMinute = endTimeMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        // Calculate total seats and available seats
        const totalSeats = hall.rows * hall.seatsPerRow;
        const seatsAvailable = totalSeats - Math.floor(Math.random() * (totalSeats / 3)); // Random number of seats already booked
        
        screenings.push({
          id: generateId(),
          movieId: movie.id,
          date: screeningDate,
          startTime,
          endTime,
          hall: hall.name,
          price: 12.99,
          seatsAvailable,
          totalSeats,
        });
      });
    }
  });
  
  return screenings;
};

export const screenings: Screening[] = generateScreenings();

// Generate some bookings
export const bookings: Booking[] = [
  {
    id: 'booking1',
    userId: 'user-id',
    screeningId: screenings[0].id,
    movieId: screenings[0].movieId,
    seats: [
      { id: 'A1', row: 'A', number: 1 },
      { id: 'A2', row: 'A', number: 2 },
    ],
    totalPrice: 25.98,
    bookingDate: '2023-05-10T14:30:00Z',
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    paymentId: 'payment123',
  },
  {
    id: 'booking2',
    userId: 'user-id',
    screeningId: screenings[5].id,
    movieId: screenings[5].movieId,
    seats: [
      { id: 'C5', row: 'C', number: 5 },
      { id: 'C6', row: 'C', number: 6 },
      { id: 'C7', row: 'C', number: 7 },
    ],
    totalPrice: 38.97,
    bookingDate: '2023-05-15T10:15:00Z',
    status: 'confirmed',
    paymentMethod: 'PayPal',
    paymentId: 'payment456',
  },
];

// Get popular movies (based on mock data)
export const getPopularMovies = (): { movie: Movie; bookingCount: number }[] => {
  return [
    { movie: movies[0], bookingCount: 158 },
    { movie: movies[1], bookingCount: 142 },
    { movie: movies[3], bookingCount: 123 },
    { movie: movies[2], bookingCount: 115 },
    { movie: movies[4], bookingCount: 89 },
  ];
};

// Get seats for a screening
export const getSeatsForScreening = (screeningId: string): SeatRow[] => {
  const screening = screenings.find(s => s.id === screeningId);
  if (!screening) return [];
  
  const hall = halls.find(h => h.name === screening.hall);
  if (!hall) return [];
  
  // Create a copy of the seat map
  const seatMap: SeatRow[] = JSON.parse(JSON.stringify(hall.seatMap));
  
  // Mark some seats as occupied (for demo purposes)
  const numOccupied = hall.rows * hall.seatsPerRow - screening.seatsAvailable;
  let occupied = 0;
  
  while (occupied < numOccupied) {
    const randomRowIndex = Math.floor(Math.random() * hall.rows);
    const randomSeatIndex = Math.floor(Math.random() * hall.seatsPerRow);
    
    if (seatMap[randomRowIndex]?.seats[randomSeatIndex]?.status === 'available') {
      seatMap[randomRowIndex].seats[randomSeatIndex].status = 'occupied';
      occupied++;
    }
  }
  
  return seatMap;
};