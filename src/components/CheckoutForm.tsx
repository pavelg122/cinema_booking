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
    onComplete: (event: { paymentIntent: { id: string } }) => {
      onSuccess(event.paymentIntent.id);
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