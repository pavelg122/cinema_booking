import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, Film, Clock, MapPin, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { format, parse, isToday, isAfter, isBefore, addDays } from 'date-fns';
import type { Database } from '../../types/database.types';

type Movie = Database['public']['Tables']['movies']['Row'];
type Hall = Database['public']['Tables']['halls']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'] & {
  movies: Movie;
  halls: Hall;
};

const ScreeningsPage: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');
  const [isAddScreeningModalOpen, setIsAddScreeningModalOpen] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [screeningsData, moviesData, hallsData] = await Promise.all([
          api.getScreenings(),
          api.getMovies(),
          api.getHalls()
        ]);
        
        setScreenings(screeningsData);
        setMovies(moviesData);
        setHalls(hallsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load screenings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate date options for filter
  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'nextWeek', label: 'Next Week' },
  ];
  
  // Filter screenings
  const filteredScreenings = screenings.filter(screening => {
    const matchesSearch = 
      screening.movies.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.halls.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const screeningDate = parse(screening.screening_date, 'yyyy-MM-dd', new Date());
    
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = isToday(screeningDate);
    } else if (dateFilter === 'tomorrow') {
      matchesDate = isToday(addDays(screeningDate, -1));
    } else if (dateFilter === 'thisWeek') {
      matchesDate = isAfter(screeningDate, new Date()) && isBefore(screeningDate, addDays(new Date(), 7));
    } else if (dateFilter === 'nextWeek') {
      matchesDate = isAfter(screeningDate, addDays(new Date(), 7)) && isBefore(screeningDate, addDays(new Date(), 14));
    }
    
    // Hall filter
    const matchesHall = hallFilter === 'all' || screening.halls.id === hallFilter;
    
    return matchesSearch && matchesDate && matchesHall;
  });
  
  // Sort screenings by date and time
  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    const dateA = a.screening_date + 'T' + a.start_time;
    const dateB = b.screening_date + 'T' + b.start_time;
    return dateA.localeCompare(dateB);
  });

  const handleAddScreening = async (screeningData: Partial<Screening>) => {
    try {
      const { data, error } = await supabase
        .from('screenings')
        .insert([screeningData])
        .select(`
          *,
          movies (*),
          halls (*)
        `)
        .single();

      if (error) throw error;

      setScreenings([...screenings, data]);
      setIsAddScreeningModalOpen(false);
    } catch (err) {
      console.error('Error adding screening:', err);
      setError('Failed to add screening');
    }
  };

  const handleEditScreening = async (id: string, screeningData: Partial<Screening>) => {
    try {
      const { data, error } = await supabase
        .from('screenings')
        .update(screeningData)
        .eq('id', id)
        .select(`
          *,
          movies (*),
          halls (*)
        `)
        .single();

      if (error) throw error;

      setScreenings(screenings.map(screening => screening.id === id ? data : screening));
      setIsAddScreeningModalOpen(false);
    } catch (err) {
      console.error('Error updating screening:', err);
      setError('Failed to update screening');
    }
  };

  const handleDeleteScreening = async (id: string) => {
    try {
      const { error } = await supabase
        .from('screenings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setScreenings(screenings.filter(screening => screening.id !== id));
    } catch (err) {
      console.error('Error deleting screening:', err);
      setError('Failed to delete screening');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Screenings</h1>
          <p className="text-secondary-400">Manage movie screenings</p>
        </div>
        
        <button
          onClick={() => setIsAddScreeningModalOpen(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Screening
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search movies or halls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
              <Search className="h-5 w-5 text-secondary-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <div className="flex gap-4">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={hallFilter}
                onChange={(e) => setHallFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Halls</option>
                {halls.map(hall => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Screenings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-700">
            <thead className="bg-secondary-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Hall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-800">
              {sortedScreenings.map((screening) => (
                <tr key={screening.id} className="hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={screening.movies.poster_url}
                        alt={screening.movies.title}
                        className="h-10 w-7 object-cover rounded-sm mr-3"
                      />
                      <div className="text-sm font-medium text-white">{screening.movies.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                      {screening.screening_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary-500" />
                      {screening.start_time} - {screening.end_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                      {screening.halls.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    ${screening.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedScreening(screening);
                          setIsAddScreeningModalOpen(true);
                        }}
                        className="text-primary-400 hover:text-primary-300 focus:outline-none"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteScreening(screening.id)}
                        className="text-red-500 hover:text-red-400 focus:outline-none"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {sortedScreenings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Calendar className="mx-auto h-10 w-10 text-secondary-600 mb-2" />
                    <p className="text-secondary-400">No screenings found</p>
                    <p className="text-secondary-500 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit Screening Modal */}
      {isAddScreeningModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-700">
              <h2 className="text-xl font-semibold text-white">
                {selectedScreening ? 'Edit Screening' : 'Add New Screening'}
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const screeningData = {
                  movie_id: formData.get('movie_id') as string,
                  hall_id: formData.get('hall_id') as string,
                  screening_date: formData.get('screening_date') as string,
                  start_time: formData.get('start_time') as string,
                  end_time: formData.get('end_time') as string,
                  price: parseFloat(formData.get('price') as string),
                };

                if (selectedScreening) {
                  handleEditScreening(selectedScreening.id, screeningData);
                } else {
                  handleAddScreening(screeningData);
                }
              }} className="space-y-6">
                <div>
                  <label htmlFor="movie_id" className="block text-sm font-medium text-secondary-300 mb-2">
                    Movie
                  </label>
                  <select
                    id="movie_id"
                    name="movie_id"
                    className="input w-full"
                    defaultValue={selectedScreening?.movie_id || ''}
                    required
                  >
                    <option value="">Select movie</option>
                    {movies.map(movie => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="screening_date" className="block text-sm font-medium text-secondary-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="screening_date"
                      name="screening_date"
                      className="input w-full"
                      defaultValue={selectedScreening?.screening_date || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="hall_id" className="block text-sm font-medium text-secondary-300 mb-2">
                      Hall
                    </label>
                    <select
                      id="hall_id"
                      name="hall_id"
                      className="input w-full"
                      defaultValue={selectedScreening?.hall_id || ''}
                      required
                    >
                      <option value="">Select hall</option>
                      {halls.map(hall => (
                        <option key={hall.id} value={hall.id}>
                          {hall.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-secondary-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="start_time"
                      name="start_time"
                      className="input w-full"
                      defaultValue={selectedScreening?.start_time || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-secondary-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="end_time"
                      name="end_time"
                      className="input w-full"
                      defaultValue={selectedScreening?.end_time || ''}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-secondary-300 mb-2">
                      Ticket Price ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      min="0"
                      className="input w-full"
                      defaultValue={selectedScreening?.price || ''}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddScreeningModalOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {selectedScreening ? 'Update Screening' : 'Add Screening'}
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

export default ScreeningsPage;