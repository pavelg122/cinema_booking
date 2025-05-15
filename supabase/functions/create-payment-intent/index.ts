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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { amount, screeningId, seatIds, reservationIds } = await req.json();

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount provided');
    }

    if (!screeningId || !seatIds || !seatIds.length || !reservationIds || !reservationIds.length) {
      throw new Error('Missing required booking information');
    }

    // Verify seat reservations
    const { data: reservations, error: reservationError } = await supabase
      .from('seat_reservations')
      .select('id, expires_at')
      .in('id', reservationIds);

    if (reservationError || !reservations || reservations.length !== reservationIds.length) {
      throw new Error('One or more seat reservations not found');
    }

    // Check if any reservations have expired
    const now = new Date();
    const expiredReservations = reservations.filter(
      reservation => new Date(reservation.expires_at) <= now
    );

    if (expiredReservations.length > 0) {
      throw new Error('One or more seat reservations have expired');
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
        reservationIds: JSON.stringify(reservationIds)
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        status: 200,
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