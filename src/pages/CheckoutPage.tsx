import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { PaymentForm } from '../components/PaymentForm';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { screening, movie, selectedSeats, totalPrice, clientSecret, screeningId, reservationIds } = location.state || {};

  console.log('Checkout page state:', { screening, movie, selectedSeats, totalPrice, clientSecret, screeningId, reservationIds });

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('Payment success callback with ID:', paymentIntentId);
    
    try {
      if (!user?.id || !screeningId || !selectedSeats) {
        console.error('Missing required information:', { userId: user?.id, screeningId, selectedSeats });
        throw new Error('Missing required booking information');
      }

      setIsProcessing(true);
      setError(null);

      console.log('Creating payment record...');
      const payment = await api.createPayment(user.id, totalPrice, paymentIntentId);
      console.log('Payment record created:', payment);

      console.log('Creating booking...');
      const booking = await api.createBooking(
        user.id,
        screeningId,
        selectedSeats.map(seat => seat.id),
        totalPrice,
        payment.id
      );
      console.log('Booking created:', booking);

      navigate('/payment-success', {
        state: {
          booking,
          screening,
          movie,
          selectedSeats,
          totalPrice
        }
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to complete booking. Please try again.');
      setIsProcessing(false);
    }
  };
  
  if (!screening || !movie || !selectedSeats || !totalPrice || !clientSecret) {
    console.error('Missing required checkout information:', { screening, movie, selectedSeats, totalPrice, clientSecret });
    navigate('/movies');
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
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Checkout</h1>
        <p className="text-secondary-300">Complete your booking by providing payment details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-secondary-800 rounded-lg p-6">
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <PaymentForm 
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            
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
                <span className="text-secondary-300">Tickets ({selectedSeats.length})</span>
                <span className="text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-secondary-300">Convenience Fee</span>
                <span className="text-white">$0.00</span>
              </div>
            </div>
            
            <div className="flex justify-between font-medium text-lg border-t border-secondary-700 pt-4">
              <span className="text-white">Total</span>
              <span className="text-primary-500">${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 flex items-start text-xs text-secondary-400">
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <p>Your seats are reserved for 10 minutes. Please complete the payment within this time to confirm your booking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;