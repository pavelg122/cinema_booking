import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

const CheckoutForm = ({ clientSecret, onSuccess }: CheckoutFormProps) => {
  const [clientSecretState, setClientSecretState] = useState<string | null>(null);

  useEffect(() => {
    setClientSecretState(clientSecret);
  }, [clientSecret]);

  const options = {
    clientSecret: clientSecretState,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#ef4444',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
  };

  return (
    <div className="w-full">
      {clientSecretState && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={options}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
};

export default CheckoutForm;