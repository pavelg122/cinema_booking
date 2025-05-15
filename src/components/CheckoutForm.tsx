import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

const CheckoutForm = ({ clientSecret, onSuccess }: CheckoutFormProps) => {
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
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  );
};

export default CheckoutForm;