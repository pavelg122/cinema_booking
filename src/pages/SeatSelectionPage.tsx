import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Info } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Database } from '../types/database.types';
import type { Seat } from '../types/booking';

type Screening = Database['public']['Tables']['screenings']['Row'] & {
  movies: Database['public']['Tables']['movies']['Row'];
  halls: Database['public']['Tables']['halls']['Row'];
};

interface SeatType {
  id: string;
  row: string;
  number: number;
  type: 'regular' | 'vip';
  status: 'available' | 'selected' | 'occupied';
  price: number;
}

interface SeatRow {
  row: string;
  seats: SeatType[];
}

const SeatSelectionPage: React.FC = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [screening, setScreening] = useState<Screening | null>(null);
  const [seatMap, setSeatMap] = useState<SeatRow[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!screeningId) return;

        const [screeningData, seatsData] = await Promise.all([
          api.getScreening(screeningId),
          api.getSeatsForScreening(screeningId)
        ]);

        setScreening(screeningData);
        setSeatMap(seatsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load screening details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [screeningId]);
  
  const handleSeatClick = (row: string, number: number, status: string, price: number, seatId: string) => {
    if (status === 'occupied') return;
    
    const existingIndex = selectedSeats.findIndex(
      seat => seat.row === row && seat.number === number
    );
    
    if (existingIndex > -1) {
      const updatedSeats = [...selectedSeats];
      updatedSeats.splice(existingIndex, 1);
      setSelectedSeats(updatedSeats);
      
      const updatedSeatMap = [...seatMap];
      const rowIndex = updatedSeatMap.findIndex(r => r.row === row);
      if (rowIndex > -1) {
        const seatIndex = updatedSeatMap[rowIndex].seats.findIndex(
          s => s.row === row && s.number === number
        );
        if (seatIndex > -1) {
          updatedSeatMap[rowIndex].seats[seatIndex].status = 'available';
        }
      }
      setSeatMap(updatedSeatMap);
      
      setTotalPrice(prevPrice => prevPrice - price);
    } else {
      const newSeat: Seat = {
        id: seatId,
        row,
        number,
      };
      setSelectedSeats([...selectedSeats, newSeat]);
      
      const updatedSeatMap = [...seatMap];
      const rowIndex = updatedSeatMap.findIndex(r => r.row === row);
      if (rowIndex > -1) {
        const seatIndex = updatedSeatMap[rowIndex].seats.findIndex(
          s => s.row === row && s.number === number
        );
        if (seatIndex > -1) {
          updatedSeatMap[rowIndex].seats[seatIndex].status = 'selected';
        }
      }
      setSeatMap(updatedSeatMap);
      
      setTotalPrice(prevPrice => prevPrice + price);
    }
  };
  
  const handleProceedToCheckout = async () => {
    if (!user?.id || !screeningId || selectedSeats.length === 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ amount: totalPrice }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      navigate('/checkout', {
        state: {
          screening,
          movie: screening?.movies,
          selectedSeats,
          totalPrice,
          clientSecret,
          screeningId,
        },
      });
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error || !screening) {
    return (
      <div className="section flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-white mb-4">
          {error || 'Screening not found'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="mb-8">
        <div className="flex items-center text-sm text-secondary-400 mb-2">
          <span>Movies</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>{screening.movies.title}</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Select Seats</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{screening.movies.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-secondary-300">
          <span>{screening.screening_date}</span>
          <span>•</span>
          <span>{screening.start_time} - {screening.end_time}</span>
          <span>•</span>
          <span>{screening.halls.name}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-secondary-800 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center">
                <div className="seat-available seat w-6 h-6 mr-2"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="seat-selected seat w-6 h-6 mr-2"></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center">
                <div className="seat-occupied seat w-6 h-6 mr-2"></div>
                <span className="text-sm">Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="seat-vip seat w-6 h-6 mr-2"></div>
                <span className="text-sm">VIP</span>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="h-6 bg-primary-800/30 rounded-t-full mx-auto w-4/5 mb-1"></div>
            <div className="text-center text-secondary-400 text-sm">SCREEN</div>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-col items-center min-w-fit">
              {seatMap.map((row) => (
                <div key={row.row} className="flex items-center mb-2">
                  <div className="w-8 text-center font-medium text-secondary-400">{row.row}</div>
                  {row.seats.map((seat) => (
                    <button
                      key={seat.id}
                      className={`seat ${
                        seat.status === 'available'
                          ? seat.type === 'vip'
                            ? 'seat-vip'
                            : 'seat-available'
                          : seat.status === 'selected'
                          ? 'seat-selected'
                          : 'seat-occupied'
                      }`}
                      onClick={() => handleSeatClick(seat.row, seat.number, seat.status, seat.price, seat.id)}
                      disabled={seat.status === 'occupied'}
                    >
                      {seat.number}
                    </button>
                  ))}
                  <div className="w-8 text-center font-medium text-secondary-400">{row.row}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-secondary-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Booking Summary</h2>
            
            <div className="flex items-start mb-4">
              <img
                src={screening.movies.poster_url}
                alt={screening.movies.title}
                className="w-20 h-auto rounded-md mr-4"
              />
              <div>
                <h3 className="font-medium text-white mb-1">{screening.movies.title}</h3>
                <div className="text-sm text-secondary-300">
                  <div>{screening.screening_date}</div>
                  <div>{screening.start_time} - {screening.end_time}</div>
                  <div>{screening.halls.name}</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-secondary-700 pt-4 mb-6">
              <h3 className="font-medium text-white mb-3">Selected Seats ({selectedSeats.length})</h3>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSeats.map((seat) => (
                    <span key={seat.id} className="bg-primary-700 text-white px-2 py-1 rounded-md text-sm">
                      {seat.row}{seat.number}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-secondary-400 mb-4">No seats selected</div>
              )}
              
              <div className="flex justify-between font-medium text-lg">
                <span className="text-white">Total:</span>
                <span className="text-primary-500">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || isProcessing}
              className={`w-full btn ${
                selectedSeats.length > 0 && !isProcessing
                  ? 'btn-primary'
                  : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </button>
            
            <div className="mt-6 flex items-start text-xs text-secondary-400">
              <Info className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <p>You can select up to 10 seats per booking. Your seats will be held for 10 minutes to complete the payment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;