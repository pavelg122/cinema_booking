import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Film, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import { format, parseISO } from 'date-fns';
import type { Database } from '../types/database.types';
import BackButton from '../components/BackButton';
import BookingProgress from '../components/BookingProgress';

type Movie = Database['public']['Tables']['movies']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'] & {
  halls: Database['public']['Tables']['halls']['Row']
};

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        if (!id) return;
        
        const [movieData, screeningsData] = await Promise.all([
          api.getMovie(id),
          api.getScreenings(id)
        ]);
        
        setMovie(movieData);
        setScreenings(screeningsData);
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error || !movie) {
    return (
      <div className="section flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {error || 'Movie not found'}
        </h2>
        <Link to="/movies" className="btn btn-primary">
          Return to Movies
        </Link>
      </div>
    );
  }
  
  // Get unique dates for this movie's screenings
  const uniqueDates = Array.from(
    new Set(
      screenings.map(s => s.screening_date)
    )
  ).sort();
  
  // Get screenings for selected date
  const dateScreenings = screenings.filter(
    s => s.screening_date === selectedDate
  ).sort((a, b) => a.start_time.localeCompare(b.start_time));
  
  // Group screenings by hall
  const screeningsByHall: Record<string, typeof screenings> = {};
  dateScreenings.forEach(screening => {
    if (screening.halls) {
      const hallName = screening.halls.name;
      if (!screeningsByHall[hallName]) {
        screeningsByHall[hallName] = [];
      }
      screeningsByHall[hallName].push(screening);
    }
  });

  return (
    <div>
      {/* Movie Banner */}
      <div className="relative h-[50vh] bg-secondary-950">
        <div className="absolute inset-0 z-0">
          <img 
            src={movie.banner_url || movie.poster_url} 
            alt={movie.title} 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-900/90 to-secondary-950/70"></div>
        </div>
      </div>
      
      <div className="section -mt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="rounded-lg overflow-hidden shadow-lg border-4 border-secondary-800">
              <img 
                src={movie.poster_url} 
                alt={movie.title} 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          {/* Movie Details */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center bg-secondary-800 px-3 py-1 rounded-md">
                <Star className="h-5 w-5 text-accent-500 mr-1" />
                <span className="text-white">{movie.imdb_rating}/10</span>
              </div>
              
              <div className="flex items-center text-secondary-300">
                <Clock className="h-5 w-5 mr-1" />
                <span>{movie.duration} min</span>
              </div>
              
              <div className="flex items-center text-secondary-300">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{format(parseISO(movie.release_date), 'MMM dd, yyyy')}</span>
              </div>
              
              <span className="px-2 py-1 bg-secondary-800 rounded-md text-sm text-white">{movie.rating}</span>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-2">
                {movie.genre.map((genre, index) => (
                  <span key={index} className="px-3 py-1 bg-secondary-800 rounded-md text-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">Synopsis</h3>
              <p className="text-secondary-300">{movie.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Director</h3>
                <p className="text-secondary-300">{movie.director}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.cast_members.map((actor, index) => (
                    <span key={index} className="text-secondary-300">
                      {actor}{index < movie.cast_members.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {movie.trailer_url && (
              <div className="mb-6">
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent flex items-center justify-center w-full sm:w-auto"
                >
                  <Film className="h-5 w-5 mr-2" />
                  Watch Trailer
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
    <BackButton />
    <BookingProgress currentStep='1' />
  </div>
        {/* Showtimes */}
        <div className="my-12">
          <h2 className="text-2xl font-bold text-white mb-6">Showtimes</h2>
          
          {/* Date Picker */}
          <div className="mb-8">
            <div className="flex overflow-x-auto pb-2 gap-2">
              {uniqueDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center min-w-24 p-3 rounded-lg transition-colors ${
                    selectedDate === date 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
                  }`}
                >
                  <CalendarDays className="h-5 w-5 mb-1" />
                  <span className="font-medium">
                    {format(parseISO(date), 'EEE')}
                  </span>
                  <span>
                    {format(parseISO(date), 'MMM d')}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Screening Times */}
          {Object.keys(screeningsByHall).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(screeningsByHall).map(([hall, hallScreenings]) => (
                <div key={hall} className="bg-secondary-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">{hall}</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {hallScreenings.map(screening => (
                      <Link
                        key={screening.id}
                        to={`/seats/${screening.id}`}
                        className="bg-secondary-700 hover:bg-primary-700 text-white py-3 px-4 rounded-md transition-colors text-center"
                      >
                        <div className="font-medium">{screening.start_time}</div>
                        <div className="text-xs text-secondary-300">
                          Standard
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary-800 rounded-lg">
              <p className="text-lg text-secondary-300">No screenings available for this date</p>
              <p className="text-sm text-secondary-400 mt-2">Please select another date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;