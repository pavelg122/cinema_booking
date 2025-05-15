import React, { useState, useMemo } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Payment form submitted');

    if (!stripe || !elements || processing) {
      console.error('Stripe not initialized or already processing');
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
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your payment.');
    } finally {
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
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: false
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

export const StripePaymentForm: React.FC<{ clientSecret: string; onSuccess: (paymentIntentId: string) => void }> = ({ clientSecret, onSuccess }) => {
  console.log('Rendering StripePaymentForm with clientSecret:', clientSecret);

  const options = useMemo(() => ({
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#ef4444',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '0.5rem',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#111827',
          border: '1px solid #374151',
          color: '#ffffff'
        },
        '.Input:focus': {
          border: '2px solid #ef4444',
          boxShadow: '0 0 0 1px #ef4444'
        },
        '.Label': {
          color: '#9CA3AF'
        },
        '.Tab': {
          backgroundColor: '#111827',
          border: '1px solid #374151'
        },
        '.Tab:hover': {
          backgroundColor: '#1f2937'
        },
        '.Tab--selected': {
          backgroundColor: '#ef4444',
          border: 'none'
        }
      }
    }
  }), [clientSecret]);

  return (
    <Elements 
      stripe={stripePromise} 
      options={options}
    >
      <PaymentForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripePaymentForm;