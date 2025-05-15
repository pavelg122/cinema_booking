import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Ticket, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || processing) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (submitError) {
        throw submitError;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your payment.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn btn-primary w-full"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
            Processing Payment...
          </div>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { screening, movie, selectedSeats, totalPrice, clientSecret, screeningId } = location.state || {};

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      if (!user?.id || !screeningId || !selectedSeats) {
        throw new Error('Missing required information');
      }

      setIsProcessing(true);
      setError(null);

      // Create payment record
      const payment = await api.createPayment(user.id, totalPrice, paymentIntentId);

      // Create booking with payment reference
      const booking = await api.createBooking(
        user.id,
        screeningId,
        selectedSeats.map(seat => seat.id),
        totalPrice,
        payment.id
      );

      // Navigate to success page
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
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
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
              <Clock className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <p>Your seats are reserved for 10 minutes. Please complete the payment within this time to confirm your booking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;