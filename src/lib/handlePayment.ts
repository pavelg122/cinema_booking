import { createEmbeddedCheckoutSession } from './stripe';

export const handlePaymentRedirect = async ({
  booking,
  userId,
  navigate,
  setError,
  setProcessingPayment,
}: {
  booking: any;
  userId: string;
  navigate: (path: string, options?: any) => void;
  setError?: (msg: string | null) => void;
  setProcessingPayment?: (id: string | null) => void;
}) => {
  if (!userId) return;

  try {
    setProcessingPayment?.(booking.id);
    setError?.(null);

    const { clientSecret } = await createEmbeddedCheckoutSession({
      amount: booking.total_price,
      screeningId: booking.screening_id,
      seatIds: [], // Already booked
      reservationIds: [],
      movieTitle: booking.screenings?.movies?.title || '',
      returnUrl: `${window.location.origin}/payment-success`,
      bookingId: booking.id,
    });

    navigate('/checkout', {
      state: {
        booking,
        screening: booking.screenings,
        movie: booking.screenings?.movies,
        totalPrice: booking.total_price,
        clientSecret,
        bookingId: booking.id,
        paymentId: booking.payment_id,
      },
    });
  } catch (err) {
    console.error('Error initiating payment:', err);
    setError?.(err instanceof Error ? err.message : 'Failed to initiate payment');
  } finally {
    setProcessingPayment?.(null);
  }
};
