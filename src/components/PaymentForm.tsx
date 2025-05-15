import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle } from 'lucide-react';

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

  console.log('PaymentForm rendered with clientSecret:', clientSecret);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Payment form submission started');

    if (!stripe || !elements || processing) {
      console.log('Missing required elements:', { stripe: !!stripe, elements: !!elements, processing });
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Confirming payment...');
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (submitError) {
        console.error('Payment confirmation error:', submitError);
        throw submitError;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your payment.');
    } finally {
      setProcessing(false);
    }
  };

  if (!stripe || !elements) {
    console.log('Stripe or Elements not initialized');
    return (
      <div className="min-h-[300px] bg-secondary-700 rounded-lg p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="min-h-[300px] bg-secondary-700 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: 'John Doe',
                email: 'john@example.com',
              }
            }
          }}
        />
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

export const StripePaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess }) => {
  console.log('Initializing StripePaymentForm with clientSecret:', clientSecret);

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#ef4444',
            colorBackground: '#1f2937',
            colorText: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      }}
    >
      <PaymentForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePaymentForm;