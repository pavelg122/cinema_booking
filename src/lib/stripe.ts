import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log('Initializing Stripe with publishable key:', !!publishableKey);

if (!publishableKey) {
  console.error('Missing Stripe publishable key!');
}

// Initialize Stripe
export const stripePromise = loadStripe(publishableKey!);

stripePromise.then(
  stripe => console.log('Stripe loaded successfully:', !!stripe),
  error => console.error('Failed to load Stripe:', error)
);

// Create payment intent
export const createPaymentIntent = async (amount: number) => {
  try {
    console.log('Creating payment intent for amount:', amount);
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment intent creation failed:', errorData);
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    console.log('Payment intent created successfully:', !!data.clientSecret);
    return data;
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