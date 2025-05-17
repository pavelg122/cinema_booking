import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Ticket } from 'lucide-react';
import RatingPopup from '../components/RatingPopup';

const PaymentSuccessPage: React.FC = () => {
  const [showRating, setShowRating] = useState(true);
  const location = useLocation();
  const { booking, screening, movie, selectedSeats, totalPrice } = location.state || {};

  if (!booking || !screening || !movie || !selectedSeats) {
    return (
      <div className="section flex items-center justify-center min-h-[70vh]">
        <div className="bg-secondary-800 rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-secondary-300 mb-6">
            Your payment has been processed successfully.
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
      </div>
    );
  }

  return (
    <div className="section flex items-center justify-center min-h-[70vh]">
      <div className="bg-secondary-800 rounded-lg p-8 max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4">Booking Confirmed!</h1>
        <p className="text-secondary-300 mb-6">
          Your tickets have been booked successfully.
        </p>

        <div className="bg-secondary-900 rounded-lg p-6 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-secondary-300">Booking ID:</span>
            <span className="text-white font-medium">{booking.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary-300">Movie:</span>
            <span className="text-white">{movie.title}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary-300">Date:</span>
            <span className="text-white">{screening.screening_date}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary-300">Time:</span>
            <span className="text-white">{screening.start_time} - {screening.end_time}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary-300">Cinema:</span>
            <span className="text-white">{screening.halls.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-secondary-300">Seats:</span>
            <span className="text-white">
              {selectedSeats.map(seat => `${seat.row}${seat.number}`).join(', ')}
            </span>
          </div>
          <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-secondary-700">
            <span className="text-white">Total Paid:</span>
            <span className="text-primary-500">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

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