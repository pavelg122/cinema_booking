import React, { useState, useEffect } from 'react';
import { Ticket, Search, Eye, Filter, Download, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import type { Database } from '../../types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  screenings: {
    movies: Database['public']['Tables']['movies']['Row'];
    halls: Database['public']['Tables']['halls']['Row'];
  } & Database['public']['Tables']['screenings']['Row'];
  booked_seats: {
    seats: {
      seat_number: number;
      seat_rows: {
        row_letter: string;
      };
    };
  }[];
};

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isViewBookingModalOpen, setIsViewBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            screenings (
              *,
              movies (*),
              halls (*)
            ),
            booked_seats (
              seats (
                seat_number,
                seat_rows (
                  row_letter
                )
              )
            )
          `)
          .order('booking_date', { ascending: false });

        if (error) throw error;
        setBookings(bookings);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  
  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.screenings.movies.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort bookings by date (most recent first)
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
  });

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: data.status } : booking
      ));
      setIsViewBookingModalOpen(false);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
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
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-secondary-400">Manage customer bookings</p>
        </div>
        
        <button
          onClick={() => console.log('Export bookings')}
          className="btn btn-outline flex items-center"
        >
          <Download size={18} className="mr-2" />
          Export
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
                placeholder="Search by ID, movie, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
              <Search className="h-5 w-5 text-secondary-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-700">
            <thead className="bg-secondary-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-800">
              {sortedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-secondary-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {booking.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={booking.screenings.movies.poster_url}
                        alt={booking.screenings.movies.title}
                        className="h-10 w-7 object-cover rounded-sm mr-3"
                      />
                      <div className="text-sm font-medium text-white">
                        {booking.screenings.movies.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-300">
                    {booking.screenings.screening_date} <br />
                    {booking.screenings.start_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    ${booking.total_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-900/40 text-green-400' 
                        : booking.status === 'pending'
                        ? 'bg-yellow-900/40 text-yellow-400'
                        : 'bg-red-900/40 text-red-400'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsViewBookingModalOpen(true);
                      }}
                      className="text-primary-400 hover:text-primary-300 focus:outline-none"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {sortedBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Ticket className="mx-auto h-10 w-10 text-secondary-600 mb-2" />
                    <p className="text-secondary-400">No bookings found</p>
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
      
      {/* View Booking Modal */}
      {isViewBookingModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                Booking Details
              </h2>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedBooking.status === 'confirmed' 
                  ? 'bg-green-900/40 text-green-400' 
                  : selectedBooking.status === 'pending'
                  ? 'bg-yellow-900/40 text-yellow-400'
                  : 'bg-red-900/40 text-red-400'
              }`}>
                {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
              </span>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src={selectedBooking.screenings.movies.poster_url}
                      alt={selectedBooking.screenings.movies.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  
                  <div className="md:w-2/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {selectedBooking.screenings.movies.title}
                      </h3>
                      <div className="text-sm text-secondary-400">
                        {selectedBooking.screenings.movies.genre.join(', ')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-secondary-400">Date</p>
                        <p className="text-sm text-white">
                          {selectedBooking.screenings.screening_date}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-secondary-400">Time</p>
                        <p className="text-sm text-white">
                          {selectedBooking.screenings.start_time} - {selectedBooking.screenings.end_time}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-secondary-400">Hall</p>
                        <p className="text-sm text-white">
                          {selectedBooking.screenings.halls.name}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-secondary-400">Seats</p>
                        <p className="text-sm text-white">
                          {selectedBooking.booked_seats.map(seat => 
                            `${seat.seats.seat_rows.row_letter}${seat.seats.seat_number}`
                          ).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-secondary-700 pt-4">
                  <h4 className="text-md font-semibold text-white mb-3">Booking Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-secondary-400">Booking ID</p>
                      <p className="text-sm text-white">{selectedBooking.id}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-secondary-400">Booking Date</p>
                      <p className="text-sm text-white">
                        {formatDate(selectedBooking.booking_date)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-secondary-400">Customer ID</p>
                      <p className="text-sm text-white">{selectedBooking.user_id}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-secondary-400">Total Amount</p>
                      <p className="text-sm text-white font-medium">
                        ${selectedBooking.total_price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-secondary-400">Payment ID</p>
                      <p className="text-sm text-white">
                        {selectedBooking.payment_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-secondary-700 flex justify-between">
              <div className="flex space-x-3">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'confirmed')}
                      className="btn btn-sm bg-green-700 text-white hover:bg-green-600 flex items-center"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'cancelled')}
                      className="btn btn-sm bg-red-700 text-white hover:bg-red-600 flex items-center"
                    >
                      <XCircle size={16} className="mr-1" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsViewBookingModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Close
                </button>
                <button
                  className="btn btn-primary btn-sm flex items-center"
                >
                  <Download size={16} className="mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;