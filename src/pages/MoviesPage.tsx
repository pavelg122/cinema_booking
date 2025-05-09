import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter, Calendar, Clock } from 'lucide-react';
import { movies } from '../data/mockData';
import { Movie } from '../types/movie';

const MoviesPage: React.FC = () => {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>(movies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get all unique genres
  const allGenres = Array.from(
    new Set(movies.flatMap(movie => movie.genre))
  ).sort();

  useEffect(() => {
    let result = movies;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        movie.genre.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by genre
    if (selectedGenre) {
      result = result.filter(movie => 
        movie.genre.includes(selectedGenre)
      );
    }
    
    setFilteredMovies(result);
  }, [searchTerm, selectedGenre]);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="section">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Movies</h1>
        <p className="text-secondary-300">Browse our current and upcoming movie releases.</p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search movies, actors, directors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            onClick={toggleFilters}
            className="btn btn-secondary flex items-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
        
        {/* Filter dropdown */}
        {isFilterOpen && (
          <div className="bg-secondary-800 p-4 rounded-md mb-4 animate-zoom-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="input w-full"
                >
                  <option value="">All Genres</option>
                  {allGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Movie List */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map(movie => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="card group">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-secondary-900/80 text-white px-2 py-1 rounded-md text-sm flex items-center">
                  <Star className="h-4 w-4 text-accent-500 mr-1" />
                  {movie.imdbRating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{movie.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {movie.genre.slice(0, 3).map((genre, index) => (
                    <span key={index} className="text-xs bg-secondary-700 text-secondary-300 px-2 py-1 rounded-md">
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-secondary-400 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{movie.duration} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
          <p className="text-secondary-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;