import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, Film, Clock, MapPin, Users } from 'lucide-react';
import { screenings, movies, halls } from '../../data/mockData';
import { format, parse, isToday, isAfter, isBefore, addDays } from 'date-fns';

const ScreeningsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [hallFilter, setHallFilter] = useState<string>('all');
  const [isAddScreeningModalOpen, setIsAddScreeningModalOpen] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState<any>(null);
  
  // Generate date options for filter
  const dateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'nextWeek', label: 'Next Week' },
  ];
  
  // Get all hall names
  const hallNames = halls.map(hall => hall.name);
  
  // Filter screenings
  const filteredScreenings = screenings.filter(screening => {
    const movie = movies.find(m => m.id === screening.movieId);
    const matchesSearch = 
      movie?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.hall.toLowerCase().includes(searchTerm.toLowerCase());
    
    const screeningDate = parse(screening.date, 'yyyy-MM-dd', new Date());
    
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
    const matchesHall = hallFilter === 'all' || screening.hall === hallFilter;
    
    return matchesSearch && matchesDate && matchesHall;
  });
  
  // Sort screenings by date and time
  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    const dateA = a.date + 'T' + a.startTime;
    const dateB = b.date + 'T' + b.startTime;
    return dateA.localeCompare(dateB);
  });
  
  // Modals
  const openAddScreeningModal = () => {
    setSelectedScreening(null);
    setIsAddScreeningModalOpen(true);
  };
  
  const openEditScreeningModal = (screening: any) => {
    setSelectedScreening(screening);
    setIsAddScreeningModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Screenings</h1>
          <p className="text-secondary-400">Manage movie screenings</p>
        </div>
        
        <button
          onClick={openAddScreeningModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Screening
        </button>
      </div>
      
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
                {hallNames.map(hall => (
                  <option key={hall} value={hall}>
                    {hall}
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
                  Seats
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
              {sortedScreenings.map((screening) => {
                const movie = movies.find(m => m.id === screening.movieId);
                return (
                  <tr key={screening.id} className="hover:bg-secondary-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={movie?.posterUrl}
                          alt={movie?.title}
                          className="h-10 w-7 object-cover rounded-sm mr-3"
                        />
                        <div className="text-sm font-medium text-white">{movie?.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                        {screening.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary-500" />
                        {screening.startTime} - {screening.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                        {screening.hall}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary-500" />
                        <div>
                          <div className="h-2 w-16 bg-secondary-700 rounded-full">
                            <div 
                              className="h-full bg-primary-500 rounded-full" 
                              style={{ width: `${((screening.totalSeats - screening.seatsAvailable) / screening.totalSeats) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{screening.seatsAvailable} / {screening.totalSeats}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ${screening.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditScreeningModal(screening)}
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
                );
              })}
              
              {sortedScreenings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
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
              <form className="space-y-6">
                <div>
                  <label htmlFor="movie" className="block text-sm font-medium text-secondary-300 mb-2">
                    Movie
                  </label>
                  <select
                    id="movie"
                    className="input w-full"
                    defaultValue={selectedScreening?.movieId || ''}
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
                    <label htmlFor="date" className="block text-sm font-medium text-secondary-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="input w-full"
                      defaultValue={selectedScreening?.date || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="hall" className="block text-sm font-medium text-secondary-300 mb-2">
                      Hall
                    </label>
                    <select
                      id="hall"
                      className="input w-full"
                      defaultValue={selectedScreening?.hall || ''}
                    >
                      <option value="">Select hall</option>
                      {hallNames.map(hall => (
                        <option key={hall} value={hall}>
                          {hall}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-secondary-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      className="input w-full"
                      defaultValue={selectedScreening?.startTime || ''}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-secondary-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      className="input w-full"
                      defaultValue={selectedScreening?.endTime || ''}
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
                      step="0.01"
                      min="0"
                      className="input w-full"
                      defaultValue={selectedScreening?.price || ''}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-secondary-700 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddScreeningModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsAddScreeningModalOpen(false)}
                className="btn btn-primary"
              >
                {selectedScreening ? 'Update Screening' : 'Add Screening'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningsPage;