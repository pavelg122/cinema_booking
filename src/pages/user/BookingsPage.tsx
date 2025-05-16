import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, Download, ChevronRight, CreditCard, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { createEmbeddedCheckoutSession } from '../../lib/stripe';
import type { Database } from '../../types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  screenings: {
    movies: Database['public']['Tables']['movies']['Row'];
    halls: Database['public']['Tables']['halls']['Row'];
  } & Database['public']['Tables']['screenings']['Row'];
};

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!user?.id) return;
        const data = await api.getUserBookings(user.id);
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id]);

  const handlePayment = async (booking: Booking) => {
    if (!user?.id || processingPayment) return;

    setProcessingPayment(booking.id);
    setError(null);

    try {
      const { clientSecret } = await createEmbeddedCheckoutSession({
        amount: booking.total_price,
        screeningId: booking.screening_id,
        seatIds: [], // We don't need this anymore since seats are already booked
        reservationIds: [], // We don't need this anymore
        movieTitle: booking.screenings.movies.title,
        returnUrl: `${window.location.origin}/payment-success`,
      });

      navigate('/checkout', {
        state: {
          booking,
          screening: booking.screenings,
          movie: booking.screenings.movies,
          totalPrice: booking.total_price,
          clientSecret,
          bookingId: booking.id,
          paymentId: booking.payment_id,
        },
      });
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-secondary-300">Manage your movie tickets and bookings</p>
      </div>

      {location.state?.message && (
        <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{location.state.message}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-secondary-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="md:flex">
                <div className="md:w-1/4 lg:w-1/5">
                  <Link to={`/movies/${booking.screenings.movies.id}`}>
                    <img
                      src={booking.screenings.movies.poster_url}
                      alt={booking.screenings.movies.title}
                      className="w-full h-full object-cover md:h-48 lg:h-full"
                    />
                  </Link>
                </div>
                
                <div className="p-6 md:w-3/4 lg:w-4/5">
                  <div className="flex flex-wrap justify-between items-start mb-4">
                    <div>
                      <Link 
                        to={`/movies/${booking.screenings.movies.id}`} 
                        className="text-xl font-semibold text-white hover:text-primary-500 transition-colors"
                      >
                        {booking.screenings.movies.title}
                      </Link>
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-secondary-300">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{booking.screenings.screening_date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{booking.screenings.start_time} - {booking.screenings.end_time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.screenings.halls.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 md:mt-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-900/40 text-green-400' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-900/40 text-yellow-400'
                          : 'bg-red-900/40 text-red-400'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-secondary-700 pt-4 mb-4">
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-secondary-400 mb-1">Booking ID</h4>
                        <p className="text-white">{booking.id}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-secondary-400 mb-1">Booking Date</h4>
                        <p className="text-white">{format(parseISO(booking.booking_date), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-secondary-400 mb-1">Total Price</h4>
                        <p className="text-primary-500 font-medium">${booking.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {booking.status === 'pending' ? (
                      <button
                        onClick={() => handlePayment(booking)}
                        disabled={processingPayment === booking.id}
                        className="btn btn-primary btn-sm flex items-center"
                      >
                        {processingPayment === booking.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Complete Payment
                          </>
                        )}
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-sm flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download Ticket
                      </button>
                    )}
                    
                    <Link 
                      to={`/movies/${booking.screenings.movies.id}`} 
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      Movie Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary-800 rounded-lg">
          <Ticket className="h-16 w-16 text-secondary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h3>
          <p className="text-secondary-400 max-w-md mx-auto mb-6">
            Looks like you haven't made any bookings yet. Browse our movies and book your first ticket!
          </p>
          <Link to="/movies" className="btn btn-primary">
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;