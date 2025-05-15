import Stripe from 'npm:stripe@14.18.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, screeningId, seatIds, reservationId } = await req.json();

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount provided');
    }

    if (!screeningId || !seatIds || !seatIds.length || !reservationId) {
      throw new Error('Missing required booking information');
    }

    // Verify seat reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('seat_reservations')
      .select('expires_at')
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      throw new Error('Seat reservation not found or expired');
    }

    if (new Date(reservation.expires_at) <= new Date()) {
      throw new Error('Seat reservation has expired');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        screeningId,
        seatIds: JSON.stringify(seatIds),
        reservationId
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Payment intent creation error:', error);

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create payment intent'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});