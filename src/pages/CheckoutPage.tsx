import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CheckoutForm from '../components/CheckoutForm';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { booking, movie, screening, totalPrice, clientSecret, bookingId, paymentId } = location.state || {};

  useEffect(() => {
    // Listen for the payment success event from the embedded form
    const handlePaymentSuccess = async (event: MessageEvent) => {
      if (event.data.type === 'embedded-checkout:completed') {
        const { paymentIntent } = event.data;
        
        if (!user?.id || !bookingId || !paymentId || isProcessing) {
          return;
        }

        setIsProcessing(true);
        setError(null);

        try {
          // Update payment status
          await api.updatePayment(paymentId, paymentIntent.id);
          
          // Update booking status
          await api.updateBookingStatus(bookingId, 'confirmed');

          navigate('/payment-success', {
            state: {
              booking,
              screening,
              movie,
              totalPrice
            }
          });
        } catch (err) {
          setError('Failed to complete booking. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    window.addEventListener('message', handlePaymentSuccess);
    return () => window.removeEventListener('message', handlePaymentSuccess);
  }, [user?.id, bookingId, paymentId, isProcessing, navigate, booking, screening, movie, totalPrice]);

  if (!booking || !movie || !screening || !totalPrice || !clientSecret) {
    navigate('/bookings');
    return null;
  }

  return (
    <div className="section">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-500 hover:text-primary-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Complete Payment</h1>
        <p className="text-secondary-300">Complete your payment to confirm your booking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2 w-full">
          <div className="bg-secondary-800 rounded-lg p-6 w-full">
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <CheckoutForm 
              clientSecret={clientSecret}
              onSuccess={() => {}} // This is now handled by the message event listener
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Booking Summary</h2>
            
            <div className="flex items-start mb-4">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-20 h-auto rounded-md mr-4"
              />
              <div>
                <h3 className="font-medium text-white mb-1">{movie.title}</h3>
                <div className="text-sm text-secondary-300">
                  <div>{screening.screening_date}</div>
                  <div>{screening.start_time} - {screening.end_time}</div>
                  <div>{screening.halls.name}</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-secondary-700 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-secondary-300">Booking ID</span>
                <span className="text-white">{booking.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-secondary-300">Total Amount</span>
                <span className="text-white">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between font-medium text-lg border-t border-secondary-700 pt-4">
              <span className="text-white">Total</span>
              <span className="text-primary-500">${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 flex items-start text-xs text-secondary-400">
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <p>Your booking will be confirmed once the payment is completed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;