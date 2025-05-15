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
    console.log('PaymentForm mounted with stripe:', !!stripe, 'elements:', !!elements);
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Starting payment submission...');

    if (!stripe || !elements) {
      console.error('Stripe or Elements not initialized');
      setError('Payment system not initialized. Please refresh the page.');
      return;
    }

    if (processing) {
      console.log('Payment already processing, skipping...');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Confirming payment...');
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        throw result.error;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        console.log('Payment succeeded:', result.paymentIntent.id);
        onSuccess(result.paymentIntent.id);
      } else {
        console.error('Payment not successful:', result.paymentIntent?.status);
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
      
      <div className="bg-secondary-900 rounded-lg p-4">
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
  console.log('StripePaymentForm rendering with clientSecret:', !!clientSecret);
  console.log('Stripe Elements options:', stripeElementsOptions);

  useEffect(() => {
    console.log('StripePaymentForm mounted');
    return () => console.log('StripePaymentForm unmounted');
  }, []);

  if (!clientSecret) {
    console.error('No client secret provided to StripePaymentForm');
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ ...stripeElementsOptions, clientSecret }}>
      <PaymentForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePaymentForm;