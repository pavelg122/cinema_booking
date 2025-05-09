import React, { useState } from 'react';
import { Film, Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { movies } from '../../data/mockData';
import { Movie } from '../../types/movie';

const MoviesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Movie>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;
  
  // Filter movies by search term
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Sort movies
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortField === 'title' || sortField === 'director' || sortField === 'releaseDate') {
      return sortDirection === 'asc' 
        ? String(a[sortField]).localeCompare(String(b[sortField]))
        : String(b[sortField]).localeCompare(String(a[sortField]));
    } else if (sortField === 'duration' || sortField === 'imdbRating') {
      return sortDirection === 'asc'
        ? Number(a[sortField]) - Number(b[sortField])
        : Number(b[sortField]) - Number(a[sortField]);
    }
    return 0;
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedMovies.length / moviesPerPage);
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = sortedMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  
  // Handle sort
  const handleSort = (field: keyof Movie) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Modals
  const openAddMovieModal = () => {
    setSelectedMovie(null);
    setIsAddMovieModalOpen(true);
  };
  
  const openEditMovieModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsAddMovieModalOpen(true);
  };
  
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
    
    // Show current page and total pages
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
          onClick={openAddMovieModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Movie
        </button>
      </div>
      
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
                    onClick={() => handleSort('imdbRating')}
                    className="flex items-center focus:outline-none"
                  >
                    Rating
                    {sortField === 'imdbRating' && (
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
                        src={movie.posterUrl}
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
                        movie.imdbRating >= 8 
                          ? 'bg-green-500' 
                          : movie.imdbRating >= 6 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}>
                        <div 
                          className="h-full rounded-full bg-opacity-40 bg-white" 
                          style={{ width: `${(movie.imdbRating / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white">{movie.imdbRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditMovieModal(movie)}
                        className="text-primary-400 hover:text-primary-300 focus:outline-none"
                      >
                        <Edit size={18} />
                      </button>
                      <button
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
            Showing {indexOfFirstMovie + 1} to {Math.min(indexOfLastMovie, sortedMovies.length)} of {sortedMovies.length} movies
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
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-secondary-300 mb-2">
                      Movie Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="input w-full"
                      defaultValue={selectedMovie?.title || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="director" className="block text-sm font-medium text-secondary-300 mb-2">
                      Director
                    </label>
                    <input
                      type="text"
                      id="director"
                      className="input w-full"
                      defaultValue={selectedMovie?.director || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="input w-full"
                    defaultValue={selectedMovie?.description || ''}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="poster" className="block text-sm font-medium text-secondary-300 mb-2">
                      Poster URL
                    </label>
                    <input
                      type="text"
                      id="poster"
                      className="input w-full"
                      defaultValue={selectedMovie?.posterUrl || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="banner" className="block text-sm font-medium text-secondary-300 mb-2">
                      Banner URL
                    </label>
                    <input
                      type="text"
                      id="banner"
                      className="input w-full"
                      defaultValue={selectedMovie?.bannerUrl || ''}
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
                      className="input w-full"
                      defaultValue={selectedMovie?.duration || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="release" className="block text-sm font-medium text-secondary-300 mb-2">
                      Release Date
                    </label>
                    <input
                      type="date"
                      id="release"
                      className="input w-full"
                      defaultValue={selectedMovie?.releaseDate || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-secondary-300 mb-2">
                      Rating
                    </label>
                    <select
                      id="rating"
                      className="input w-full"
                      defaultValue={selectedMovie?.rating || ''}
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
                      className="input w-full"
                      defaultValue={selectedMovie?.genre.join(', ') || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cast" className="block text-sm font-medium text-secondary-300 mb-2">
                      Cast (comma separated)
                    </label>
                    <input
                      type="text"
                      id="cast"
                      className="input w-full"
                      defaultValue={selectedMovie?.cast.join(', ') || ''}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="imdb" className="block text-sm font-medium text-secondary-300 mb-2">
                      IMDB Rating
                    </label>
                    <input
                      type="number"
                      id="imdb"
                      step="0.1"
                      min="0"
                      max="10"
                      className="input w-full"
                      defaultValue={selectedMovie?.imdbRating || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="trailer" className="block text-sm font-medium text-secondary-300 mb-2">
                      Trailer URL
                    </label>
                    <input
                      type="text"
                      id="trailer"
                      className="input w-full"
                      defaultValue={selectedMovie?.trailerUrl || ''}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-secondary-700 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddMovieModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsAddMovieModalOpen(false)}
                className="btn btn-primary"
              >
                {selectedMovie ? 'Update Movie' : 'Add Movie'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;