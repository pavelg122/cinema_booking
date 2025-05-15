import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Stripe publishable key');
}

console.log('Initializing Stripe with key:', publishableKey);

export const stripePromise = loadStripe(publishableKey);

// Create payment intent
export const createPaymentIntent = async (amount: number) => {
  try {
    console.log('Creating payment intent for amount:', amount);
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    console.log('Payment intent created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};