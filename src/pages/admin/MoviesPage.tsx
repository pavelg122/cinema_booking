import React, { useState, useEffect } from 'react';
import { Film, Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Movie = Database['public']['Tables']['movies']['Row'];

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Movie>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const moviesPerPage = 8;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await api.getMovies();
        setMovies(data);
        setFilteredMovies(data);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
        movie.cast_members.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        movie.genre.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort movies
    result = [...result].sort((a, b) => {
      if (sortField === 'title' || sortField === 'director' || sortField === 'release_date') {
        return sortDirection === 'asc' 
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]));
      } else if (sortField === 'duration' || sortField === 'imdb_rating') {
        return sortDirection === 'asc'
          ? Number(a[sortField]) - Number(b[sortField])
          : Number(b[sortField]) - Number(a[sortField]);
      }
      return 0;
    });
    
    setFilteredMovies(result);
  }, [searchTerm, sortField, sortDirection, movies]);

  const handleSort = (field: keyof Movie) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddMovie = async (movieData: Partial<Movie>) => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .insert([movieData])
        .select()
        .single();

      if (error) throw error;

      setMovies([...movies, data]);
      setIsAddMovieModalOpen(false);
    } catch (err) {
      console.error('Error adding movie:', err);
      setError('Failed to add movie');
    }
  };

  const handleEditMovie = async (id: string, movieData: Partial<Movie>) => {
    try {
      // First verify the movie exists and get its current state
      const { data: currentMovie, error: fetchError } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!currentMovie) {
        throw new Error(`Movie with ID ${id} no longer exists`);
      }

      // Compare timestamps to check for concurrent modifications
      if (selectedMovie && currentMovie.updated_at !== selectedMovie.updated_at) {
        throw new Error('This movie has been modified by another user. Please refresh and try again.');
      }

      // Proceed with update if movie exists and hasn't been modified
      const { data: updatedMovie, error: updateError } = await supabase
        .from('movies')
        .update({
          ...movieData,
          updated_at: new Date().toISOString() // Update the timestamp
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (!updatedMovie) {
        throw new Error('No data returned after update');
      }

      // Update local state
      setMovies(prevMovies => prevMovies.map(movie => 
        movie.id === id ? updatedMovie : movie
      ));
      setSelectedMovie(null);
      setIsAddMovieModalOpen(false);
      setError(null);

    } catch (err) {
      console.error('Error updating movie:', err);
      setError(err instanceof Error ? err.message : 'Failed to update movie');
      
      // If the error indicates the movie was modified by another user,
      // refresh the movies list to get the latest data
      if (err instanceof Error && err.message.includes('modified by another user')) {
        const { data: refreshedMovies } = await supabase
          .from('movies')
          .select('*');
          
        if (refreshedMovies) {
          setMovies(refreshedMovies);
        }
      }
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMovies(movies.filter(movie => movie.id !== id));
    } catch (err) {
      console.error('Error deleting movie:', err);
      setError('Failed to delete movie');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-md text-secondary-400 hover:text-white hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
    );
    
    buttons.push(
      <span key="page-info" className="text-secondary-400 text-sm flex items-center px-2">
        Page {currentPage} of {totalPages}
      </span>
    );
    
    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-2 rounded-md text-secondary-400 hover:text-white hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    );
    
    return buttons;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Movies</h1>
          <p className="text-secondary-400">Manage movie catalog</p>
        </div>
        
        <button
          onClick={() => setIsAddMovieModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Movie
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 border-b border-secondary-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
              <Search className="h-5 w-5 text-secondary-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        {/* Movies Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-700">
            <thead className="bg-secondary-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center focus:outline-none"
                  >
                    Title
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('director')}
                    className="flex items-center focus:outline-none"
                  >
                    Director
                    {sortField === 'director' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('duration')}
                    className="flex items-center focus:outline-none"
                  >
                    Duration
                    {sortField === 'duration' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('imdb_rating')}
                    className="flex items-center focus:outline-none"
                  >
                    Rating
                    {sortField === 'imdb_rating' && (
                      sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-800">
              {currentMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="h-10 w-7 object-cover rounded-sm mr-3"
                      />
                      <div className="text-sm font-medium text-white">{movie.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    {movie.director}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.map((genre, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-secondary-700 rounded-full text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    {movie.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <div className={`h-2 w-12 rounded-full mr-2 ${
                        movie.imdb_rating >= 8 
                          ? 'bg-green-500' 
                          : movie.imdb_rating >= 6 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}>
                        <div 
                          className="h-full rounded-full bg-opacity-40 bg-white" 
                          style={{ width: `${(movie.imdb_rating / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white">{movie.imdb_rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMovie(movie);
                          setIsAddMovieModalOpen(true);
                        }}
                        className="text-primary-400 hover:text-primary-300 focus:outline-none"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="text-red-500 hover:text-red-400 focus:outline-none"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentMovies.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Film className="mx-auto h-10 w-10 text-secondary-600 mb-2" />
                    <p className="text-secondary-400">No movies found</p>
                    {searchTerm && (
                      <p className="text-secondary-500 text-sm mt-1">
                        Try adjusting your search query
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-secondary-700">
          <div className="text-sm text-secondary-400">
            Showing {indexOfFirstMovie + 1} to {Math.min(indexOfLastMovie, filteredMovies.length)} of {filteredMovies.length} movies
          </div>
          <div className="flex items-center space-x-2">
            {renderPaginationButtons()}
          </div>
        </div>
      </div>
      
      {/* Add/Edit Movie Modal */}
      {isAddMovieModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-700">
              <h2 className="text-xl font-semibold text-white">
                {selectedMovie ? 'Edit Movie' : 'Add New Movie'}
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const movieData = {
                  title: formData.get('title') as string,
                  director: formData.get('director') as string,
                  description: formData.get('description') as string,
                  poster_url: formData.get('poster_url') as string,
                  banner_url: formData.get('banner_url') as string,
                  duration: parseInt(formData.get('duration') as string),
                  release_date: formData.get('release_date') as string,
                  genre: (formData.get('genre') as string).split(',').map(g => g.trim()),
                  cast_members: (formData.get('cast_members') as string).split(',').map(c => c.trim()),
                  rating: formData.get('rating') as string,
                  imdb_rating: parseFloat(formData.get('imdb_rating') as string),
                  trailer_url: formData.get('trailer_url') as string,
                };

                if (selectedMovie) {
                  handleEditMovie(selectedMovie.id, movieData);
                } else {
                  handleAddMovie(movieData);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-secondary-300 mb-2">
                      Movie Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="input w-full"
                      defaultValue={selectedMovie?.title || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="director" className="block text-sm font-medium text-secondary-300 mb-2">
                      Director
                    </label>
                    <input
                      type="text"
                      id="director"
                      name="director"
                      className="input w-full"
                      defaultValue={selectedMovie?.director || ''}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="input w-full"
                    defaultValue={selectedMovie?.description || ''}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="poster_url" className="block text-sm font-medium text-secondary-300 mb-2">
                      Poster URL
                    </label>
                    <input
                      type="url"
                      id="poster_url"
                      name="poster_url"
                      className="input w-full"
                      defaultValue={selectedMovie?.poster_url || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="banner_url" className="block text-sm font-medium text-secondary-300 mb-2">
                      Banner URL
                    </label>
                    <input
                      type="url"
                      id="banner_url"
                      name="banner_url"
                      className="input w-full"
                      defaultValue={selectedMovie?.banner_url || ''}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-secondary-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      className="input w-full"
                      defaultValue={selectedMovie?.duration || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="release_date" className="block text-sm font-medium text-secondary-300 mb-2">
                      Release Date
                    </label>
                    <input
                      type="date"
                      id="release_date"
                      name="release_date"
                      className="input w-full"
                      defaultValue={selectedMovie?.release_date || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-secondary-300 mb-2">
                      Rating
                    </label>
                    <select
                      id="rating"
                      name="rating"
                      className="input w-full"
                      defaultValue={selectedMovie?.rating || ''}
                      required
                    >
                      <option value="">Select rating</option>
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="NC-17">NC-17</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-secondary-300 mb-2">
                      Genre (comma separated)
                    </label>
                    <input
                      type="text"
                      id="genre"
                      name="genre"
                      className="input w-full"
                      defaultValue={selectedMovie?.genre.join(', ') || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cast_members" className="block text-sm font-medium text-secondary-300 mb-2">
                      Cast (comma separated)
                    </label>
                    <input
                      type="text"
                      id="cast_members"
                      name="cast_members"
                      className="input w-full"
                      defaultValue={selectedMovie?.cast_members.join(', ') || ''}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="imdb_rating" className="block text-sm font-medium text-secondary-300 mb-2">
                      IMDB Rating
                    </label>
                    <input
                      type="number"
                      id="imdb_rating"
                      name="imdb_rating"
                      step="0.1"
                      min="0"
                      max="10"
                      className="input w-full"
                      defaultValue={selectedMovie?.imdb_rating || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="trailer_url" className="block text-sm font-medium text-secondary-300 mb-2">
                      Trailer URL
                    </label>
                    <input
                      type="url"
                      id="trailer_url"
                      name="trailer_url"
                      className="input w-full"
                      defaultValue={selectedMovie?.trailer_url || ''}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMovie(null);
                      setIsAddMovieModalOpen(false);
                      setError(null);
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {selectedMovie ? 'Update Movie' : 'Add Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;