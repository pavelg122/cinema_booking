import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Ticket, Clock, ArrowLeft, CheckCircle } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  
  // Get data from location state
  const { screening, movie, selectedSeats, totalPrice } = location.state || {};
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsConfirmed(true);
    }, 1500);
  };
  
  // If no data, redirect back
  if (!screening || !movie || !selectedSeats || totalPrice === undefined) {
    navigate('/movies');
    return null;
  }

  return (
    <div className="section">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-500 hover:text-primary-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Seat Selection
        </button>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Checkout</h1>
        <p className="text-secondary-300">Complete your booking by providing payment details.</p>
      </div>
      
      {isConfirmed ? (
        <div className="bg-secondary-800 rounded-lg p-8 max-w-2xl mx-auto animate-zoom-in">
          <div className="flex flex-col items-center text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-secondary-300">Your tickets have been booked successfully.</p>
          </div>
          
          <div className="bg-secondary-900 rounded-lg p-6 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-secondary-300">Booking ID:</span>
              <span className="text-white font-medium">{bookingId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-secondary-300">Movie:</span>
              <span className="text-white">{movie.title}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-secondary-300">Date:</span>
              <span className="text-white">{screening.date}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-secondary-300">Time:</span>
              <span className="text-white">{screening.startTime} - {screening.endTime}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-secondary-300">Cinema:</span>
              <span className="text-white">{screening.hall}</span>
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
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigate('/bookings')}
              className="btn btn-primary"
            >
              <Ticket className="h-5 w-5 mr-2" />
              View My Bookings
            </button>
            
            <button
              onClick={() => navigate('/movies')}
              className="btn btn-outline"
            >
              Browse More Movies
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-secondary-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-secondary-700 rounded-lg cursor-pointer hover:bg-secondary-700/30 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="form-radio h-5 w-5 text-primary-600"
                    />
                    <CreditCard className="h-6 w-6 ml-3 mr-3 text-secondary-300" />
                    <div className="ml-2">
                      <div className="text-white font-medium">Credit/Debit Card</div>
                      <div className="text-secondary-400 text-sm">Pay securely with your card</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-secondary-700 rounded-lg cursor-pointer hover:bg-secondary-700/30 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="form-radio h-5 w-5 text-primary-600"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-3 mr-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217a.641.641 0 0 1 .632-.544h7.168c2.379 0 4.086.579 5.066 1.722.898 1.048 1.219 2.428.954 4.108-.018.104-.036.209-.058.314l-.008.04v.02c-.608 3.407-2.86 5.196-6.67 5.296h-.051c-.954 0-1.718.077-2.274.229a1.982 1.982 0 0 0-1.024.644c-.211.268-.361.611-.444 1.016a5.94 5.94 0 0 0-.044.428l-.368 4.876a.646.646 0 0 1-.64.561zM9.768 9.864c.143-.889.566-1.587 1.261-2.075.758-.534 1.777-.798 3.033-.784h.123c2.301 0 3.296 1.186 3.348 3.208.018.606-.039 1.249-.173 1.925-.428 2.239-1.744 3.374-3.917 3.374h-.062c-.961 0-1.729-.193-2.286-.575-.575-.395-.876-.995-.876-1.825 0-.239.021-.493.062-.757l.486-2.491zm10.17-5.203c0 .642-.138 1.212-.41 1.694a3.294 3.294 0 0 1-1.259 1.259c-.927.552-2.16.836-3.671.836h-3.877l-1.502 9.633h-4.12L7.32 3.347h7.168c1.5 0 2.721.284 3.651.836.533.32.961.739 1.275 1.248.32.508.486 1.073.486 1.685z" />
                    </svg>
                    <div className="ml-2">
                      <div className="text-white font-medium">PayPal</div>
                      <div className="text-secondary-400 text-sm">Pay with your PayPal account</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'credit_card' && (
                <div className="bg-secondary-800 rounded-lg p-6 mb-6 animate-slide-up">
                  <h2 className="text-xl font-semibold text-white mb-4">Card Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card-name" className="block text-sm font-medium text-secondary-300 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="card-name"
                        className="input w-full"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-secondary-300 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card-number"
                        className="input w-full"
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry-date" className="block text-sm font-medium text-secondary-300 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          id="expiry-date"
                          className="input w-full"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-secondary-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          className="input w-full"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-secondary-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Billing Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-secondary-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        className="input w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-secondary-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="input w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-secondary-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              
              <div className="flex items-start mb-4">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-20 h-auto rounded-md mr-4"
                />
                <div>
                  <h3 className="font-medium text-white mb-1">{movie.title}</h3>
                  <div className="text-sm text-secondary-300">
                    <div>{screening.date}</div>
                    <div>{screening.startTime} - {screening.endTime}</div>
                    <div>{screening.hall}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-secondary-700 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-secondary-300">Tickets ({selectedSeats.length})</span>
                  <span className="text-white">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-secondary-300">Convenience Fee</span>
                  <span className="text-white">$0.00</span>
                </div>
              </div>
              
              <div className="flex justify-between font-medium text-lg border-t border-secondary-700 pt-4">
                <span className="text-white">Total</span>
                <span className="text-primary-500">${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="mt-6 flex items-start text-xs text-secondary-400">
                <Clock className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <p>Your seats are reserved for 10 minutes. Please complete the payment within this time to confirm your booking.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;