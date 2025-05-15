import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Create payment intent
export const createPaymentIntent = async (amount: number) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const stripeElementsOptions = {
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
    rules: {
      '.Input': {
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
      },
      '.Input:focus': {
        border: '2px solid #ef4444',
        boxShadow: '0 0 0 1px #ef4444',
      },
      '.Label': {
        color: '#d4d4d8',
      },
    },
  },
  loader: 'auto',
};