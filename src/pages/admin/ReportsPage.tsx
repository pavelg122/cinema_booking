import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TicketCheck, Film, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import type { Database } from '../../types/database.types';

type Movie = Database['public']['Tables']['movies']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'] & {
  movies: Movie;
  halls: Database['public']['Tables']['halls']['Row'];
};
type Booking = Database['public']['Tables']['bookings']['Row'];

const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<'popular' | 'revenue' | 'seats'>('popular');
  const [screeningId, setScreeningId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    movies: Movie[];
    screenings: Screening[];
    bookings: Booking[];
    occupancy: any[];
    revenue: {
      total: number;
      confirmed: number;
      pending: number;
    };
  }>({
    movies: [],
    screenings: [],
    bookings: [],
    occupancy: [],
    revenue: {
      total: 0,
      confirmed: 0,
      pending: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movies, screenings, bookings, occupancy] = await Promise.all([
          api.getMovies(),
          api.getScreenings(),
          supabase.from('bookings').select('*'),
          api.getScreeningOccupancy()
        ]);

        const revenue = {
          total: bookings.data?.reduce((sum, b) => sum + b.total_price, 0) || 0,
          confirmed: bookings.data?.filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.total_price, 0) || 0,
          pending: bookings.data?.filter(b => b.status === 'pending')
            .reduce((sum, b) => sum + b.total_price, 0) || 0
        };

        setData({
          movies,
          screenings,
          bookings: bookings.data || [],
          occupancy,
          revenue
        });
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-secondary-400">Generate and view analytics reports</p>
        </div>
        
        <button
          onClick={() => console.log('Export report')}
          className="btn btn-outline flex items-center"
        >
          <Download size={18} className="mr-2" />
          Export Data
        </button>
      </div>
      
      {/* Report Type Tabs */}
      <div className="bg-secondary-800 rounded-lg overflow-hidden mb-8">
        <div className="flex border-b border-secondary-700">
          <button
            onClick={() => setReport('popular')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              report === 'popular' 
                ? 'text-white border-b-2 border-primary-500' 
                : 'text-secondary-400 hover:text-white'
            }`}
          >
            <TrendingUp size={18} className="mr-2" />
            Popular Movies
          </button>
          <button
            onClick={() => setReport('revenue')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              report === 'revenue' 
                ? 'text-white border-b-2 border-primary-500' 
                : 'text-secondary-400 hover:text-white'
            }`}
          >
            <BarChart3 size={18} className="mr-2" />
            Revenue
          </button>
          <button
            onClick={() => setReport('seats')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              report === 'seats' 
                ? 'text-white border-b-2 border-primary-500' 
                : 'text-secondary-400 hover:text-white'
            }`}
          >
            <TicketCheck size={18} className="mr-2" />
            Seat Occupancy
          </button>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="bg-secondary-800 rounded-lg overflow-hidden">
        {/* Report Filter Bar */}
        <div className="p-4 border-b border-secondary-700">
          <div className="flex items-center">
            <Filter size={18} className="text-secondary-400 mr-2" />
            <span className="text-sm font-medium text-white mr-4">Filter:</span>
            
            {report === 'popular' && (
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="input"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            )}
            
            {report === 'seats' && (
              <select
                value={screeningId}
                onChange={(e) => setScreeningId(e.target.value)}
                className="input"
              >
                <option value="">Select a screening</option>
                {data.screenings.map(screening => (
                  <option key={screening.id} value={screening.id}>
                    {screening.movies.title} - {screening.screening_date} {screening.start_time}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        
        {/* Popular Movies Report */}
        {report === 'popular' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Film className="h-6 w-6 text-primary-500 mr-2" />
              Most Popular Movies {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : timeRange === 'year' ? 'This Year' : 'All Time'}
            </h2>
            
            <div className="space-y-6">
              {data.movies.map((movie, index) => {
                const bookingCount = data.bookings.filter(b => 
                  data.screenings.find(s => 
                    s.id === b.screening_id && s.movie_id === movie.id
                  )
                ).length;

                return (
                  <div key={movie.id} className="bg-secondary-700 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-secondary-900 text-primary-500 rounded-full font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="md:w-1/4 lg:w-1/6">
                        <img 
                          src={movie.poster_url} 
                          alt={movie.title} 
                          className="w-32 h-auto rounded-md mx-auto md:mx-0"
                        />
                      </div>
                      
                      <div className="md:flex-1 text-center md:text-left">
                        <h3 className="text-lg font-semibold text-white mb-1">{movie.title}</h3>
                        <div className="text-sm text-secondary-400 mb-3">
                          <span>{movie.genre.join(', ')}</span>
                          <span className="mx-2">•</span>
                          <span>{movie.duration} min</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                          <div>
                            <p className="text-xs text-secondary-400 mb-1">Total Bookings</p>
                            <p className="text-lg font-semibold text-white">{bookingCount}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-secondary-400 mb-1">Average Rating</p>
                            <div className="flex items-center">
                              <div className="flex items-center text-accent-500">
                                {[...Array(5)].map((_, i) => (
                                  <svg 
                                    key={i} 
                                    className={`w-4 h-4 ${i < Math.floor(movie.imdb_rating / 2) ? 'fill-current' : 'stroke-current fill-none'}`} 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                ))}
                                <span className="ml-1 text-white">{movie.imdb_rating}/10</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-secondary-400 mb-1">Revenue</p>
                            <p className="text-lg font-semibold text-white">
                              ${data.bookings
                                .filter(b => 
                                  data.screenings.find(s => 
                                    s.id === b.screening_id && s.movie_id === movie.id
                                  )
                                )
                                .reduce((sum, b) => sum + b.total_price, 0)
                                .toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 w-full md:w-auto">
                        <div className="h-6 w-32 bg-secondary-900 rounded-full overflow-hidden mx-auto md:mx-0">
                          <div 
                            className="h-full bg-primary-600" 
                            style={{ width: `${(bookingCount / Math.max(...data.movies.map(m => 
                              data.bookings.filter(b => 
                                data.screenings.find(s => 
                                  s.id === b.screening_id && s.movie_id === m.id
                                )
                              ).length
                            ))) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-secondary-400 text-center md:text-right mt-1">
                          {Math.round((bookingCount / Math.max(...data.movies.map(m => 
                            data.bookings.filter(b => 
                              data.screenings.find(s => 
                                s.id === b.screening_id && s.movie_id === m.id
                              )
                            ).length
                          ))) * 100)}% of top
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Revenue Report */}
        {report === 'revenue' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 text-primary-500 mr-2" />
              Revenue Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-secondary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary-500">
                  ${data.revenue.total.toFixed(2)}
                </p>
                <div className="flex justify-between mt-4 text-sm">
                  <div>
                    <p className="text-secondary-400">Confirmed</p>
                    <p className="text-white">${data.revenue.confirmed.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Pending</p>
                    <p className="text-white">${data.revenue.pending.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Total Bookings</h3>
                <p className="text-3xl font-bold text-primary-500">{data.bookings.length}</p>
                <div className="flex justify-between mt-4 text-sm">
                  <div>
                    <p className="text-secondary-400">Confirmed</p>
                    <p className="text-white">
                      {data.bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Avg. Ticket Price</p>
                    <p className="text-white">
                      ${(data.revenue.total / data.bookings.length || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue by Hall</h3>
                <div className="space-y-3">
                  {data.screenings.reduce((acc, screening) => {
                    const hallRevenue = data.bookings
                      .filter(b => b.screening_id === screening.id)
                      .reduce((sum, b) => sum + b.total_price, 0);
                    
                    const existingHall = acc.find(h => h.id === screening.halls.id);
                    if (existingHall) {
                      existingHall.revenue += hallRevenue;
                    } else {
                      acc.push({
                        id: screening.halls.id,
                        name: screening.halls.name,
                        revenue: hallRevenue
                      });
                    }
                    return acc;
                  }, [] as { id: string; name: string; revenue: number }[])
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((hall, index) => (
                    <div key={hall.id} className="flex items-center">
                      <div className="w-24 mr-3 text-sm">{hall.name}</div>
                      <div className="flex-1 h-4 bg-secondary-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${index === 0 ? 'bg-primary-600' : index === 1 ? 'bg-accent-600' : 'bg-green-600'}`} 
                          style={{ width: `${(hall.revenue / data.revenue.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-24 text-right text-sm">
                        ${hall.revenue.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-secondary-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Revenue Over Time</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center text-secondary-400">
                  <BarChart3 size={40} className="mx-auto mb-2 text-secondary-600" />
                  <p>Revenue chart visualization would appear here</p>
                  <p className="text-sm">Showing data for last 7 days</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Seat Occupancy Report */}
        {report === 'seats' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TicketCheck className="h-6 w-6 text-primary-500 mr-2" />
              Seat Occupancy Analysis
            </h2>
            
            {screeningId ? (
              <div>
                {(() => {
                  const screening = data.screenings.find(s => s.id === screeningId);
                  if (!screening) return null;

                  const bookings = data.bookings.filter(b => b.screening_id === screeningId);
                  const occupancyData = data.occupancy.find(o => o.screening_id === screeningId);
                  
                  if (!occupancyData) return null;

                  return (
                    <>
                      <div className="mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 bg-secondary-700 rounded-lg p-4">
                          <div className="md:w-1/4 lg:w-1/6">
                            <img 
                              src={screening.movies.poster_url} 
                              alt={screening.movies.title} 
                              className="w-32 h-auto rounded-md mx-auto md:mx-0"
                            />
                          </div>
                          
                          <div className="md:flex-1 text-center md:text-left">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {screening.movies.title}
                            </h3>
                            <div className="text-sm text-secondary-400 mb-3">
                              <span>{screening.screening_date}</span>
                              <span className="mx-2">•</span>
                              <span>{screening.start_time} - {screening.end_time}</span>
                              <span className="mx-2">•</span>
                              <span>{screening.halls.name}</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-secondary-400 mb-1">Total Seats</p>
                                <p className="text-lg font-semibold text-white">
                                  {occupancyData.total_seats}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-secondary-400 mb-1">Booked Seats</p>
                                <p className="text-lg font-semibold text-white">
                                  {occupancyData.booked_seats}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-secondary-400 mb-1">Occupancy Rate</p>
                                <p className="text-lg font-semibold text-white">
                                  {occupancyData.occupancy_percentage}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-secondary-700 rounded-lg p-6">
                          <h3 className="text-md font-semibold text-white mb-4">Revenue Breakdown</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-secondary-300 mb-1">Total Revenue</p>
                              <p className="text-lg font-semibold text-primary-500">
                                ${bookings.reduce((sum, b) => sum + b.total_price, 0).toFixed(2)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-secondary-300 mb-1">Average per Seat</p>
                              <p className="text-lg font-semibold text-white">
                                ${(bookings.reduce((sum, b) => sum + b.total_price, 0) / occupancyData.booked_seats || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-secondary-700 rounded-lg p-6">
                          <h3 className="text-md font-semibold text-white mb-4">Booking Status</h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-secondary-300">Confirmed Bookings</span>
                                <span className="text-sm text-white">
                                  {bookings.filter(b => b.status === 'confirmed').length}
                                </span>
                              </div>
                              <div className="h-2 bg-secondary-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ 
                                    width: `${(bookings.filter(b => b.status === 'confirmed').length / bookings.length) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-secondary-300">Pending Bookings</span>
                                <span className="text-sm text-white">
                                  {bookings.filter(b => b.status === 'pending').length}
                                </span>
                              </div>
                              <div className="h-2 bg-secondary-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500" 
                                  style={{ 
                                    width: `${(bookings.filter(b => b.status === 'pending').length / bookings.length) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-secondary-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Screening Selected</h3>
                <p className="text-secondary-400 max-w-md mx-auto">
                  Please select a screening from the dropdown above to view seat occupancy data.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;