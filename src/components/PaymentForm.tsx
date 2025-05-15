import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, stripeElementsOptions } from '../lib/stripe';
import { AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      console.log('Stripe or Elements not initialized');
    } else {
      console.log('Stripe and Elements initialized successfully');
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe not initialized');
      setError('Payment system not initialized. Please refresh the page.');
      return;
    }

    if (processing) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Confirming payment...');
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (submitError) {
        throw submitError;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else {
        throw new Error('Payment was not successful');
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
      
      <div className="min-h-[300px] flex items-center justify-center">
        <PaymentElement />
      </div>
      
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

export const StripePaymentForm: React.FC<{ clientSecret: string; onSuccess: (paymentIntentId: string) => void }> = ({ clientSecret, onSuccess }) => {
  console.log('Initializing StripePaymentForm with clientSecret:', clientSecret);

  if (!clientSecret) {
    console.error('No client secret provided');
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ 
      clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#ef4444',
          colorBackground: '#18181b',
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '0.5rem',
          spacingUnit: '4px',
        },
      },
    }}>
      <PaymentForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePaymentForm;