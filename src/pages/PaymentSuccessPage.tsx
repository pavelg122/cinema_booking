import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Ticket } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RatingPopup from '../components/RatingPopup';

const PaymentSuccessPage: React.FC = () => {
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    const checkFirstBooking = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        // Check if user has any previous ratings
        const { data: ratings } = await supabase
          .from('ratings')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);

        // Show rating popup if this is their first booking
        if (!ratings?.length) {
          setShowRating(true);
        }
      } catch (error) {
        console.error('Error checking first booking:', error);
      }
    };

    checkFirstBooking();
  }, []);

  return (
    <div className="section flex items-center justify-center min-h-[70vh]">
      <div className="bg-secondary-800 rounded-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-secondary-300 mb-6">
          Your payment has been processed successfully. Your tickets have been booked and sent to your email.
        </p>
        <div className="space-y-4">
          <Link to="/bookings" className="btn btn-primary w-full flex items-center justify-center">
            <Ticket className="h-5 w-5 mr-2" />
            View My Bookings
          </Link>
          <Link to="/movies" className="btn btn-outline w-full">
            Browse More Movies
          </Link>
        </div>
      </div>

      {showRating && (
        <RatingPopup onClose={() => setShowRating(false)} />
      )}
    </div>
  );
};

export default PaymentSuccessPage;