import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { screenings, movies, getSeatsForScreening } from '../data/mockData';
import { SeatRow } from '../types/screening';
import { Seat } from '../types/booking';
import { ChevronRight, Info } from 'lucide-react';

const SeatSelectionPage: React.FC = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  
  const [seatMap, setSeatMap] = useState<SeatRow[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Find screening and movie
  const screening = screenings.find(s => s.id === screeningId);
  const movie = screening ? movies.find(m => m.id === screening.movieId) : null;
  
  useEffect(() => {
    if (screeningId) {
      const seats = getSeatsForScreening(screeningId);
      setSeatMap(seats);
    }
  }, [screeningId]);
  
  // Handle seat selection
  const handleSeatClick = (row: string, number: number, status: string, price: number) => {
    if (status === 'occupied') return;
    
    // Check if seat is already selected
    const existingIndex = selectedSeats.findIndex(
      seat => seat.row === row && seat.number === number
    );
    
    if (existingIndex > -1) {
      // Remove seat from selection
      const updatedSeats = [...selectedSeats];
      updatedSeats.splice(existingIndex, 1);
      setSelectedSeats(updatedSeats);
      
      // Update seat map status
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
      
      // Update total price
      setTotalPrice(prevPrice => prevPrice - price);
    } else {
      // Add seat to selection
      const newSeat: Seat = {
        id: `${row}${number}`,
        row,
        number,
      };
      setSelectedSeats([...selectedSeats, newSeat]);
      
      // Update seat map status
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
      
      // Update total price
      setTotalPrice(prevPrice => prevPrice + price);
    }
  };
  
  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;
    
    // Create a booking ID (would normally be done on the server)
    const bookingId = `booking-${Date.now()}`;
    
    // Navigate to checkout
    navigate(`/checkout/${bookingId}`, {
      state: {
        screening,
        movie,
        selectedSeats,
        totalPrice,
      },
    });
  };
  
  if (!screening || !movie) {
    return (
      <div className="section flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Screening not found</h2>
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
          <span>{movie.title}</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Select Seats</span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-secondary-300">
          <span>{screening.date}</span>
          <span>•</span>
          <span>{screening.startTime} - {screening.endTime}</span>
          <span>•</span>
          <span>{screening.hall}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Seat legend */}
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
          
          {/* Screen */}
          <div className="mb-8">
            <div className="h-6 bg-primary-800/30 rounded-t-full mx-auto w-4/5 mb-1"></div>
            <div className="text-center text-secondary-400 text-sm">SCREEN</div>
          </div>
          
          {/* Seat map */}
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
                      onClick={() => handleSeatClick(seat.row, seat.number, seat.status, seat.price)}
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
          {/* Booking summary */}
          <div className="bg-secondary-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-white mb-4">Booking Summary</h2>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-secondary-300">Movie:</span>
                <span className="text-white font-medium">{movie.title}</span>
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
            
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0}
              className={`w-full btn ${
                selectedSeats.length > 0 ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'
              }`}
            >
              Proceed to Checkout
            </button>
            
            <div className="mt-4 flex items-start text-xs text-secondary-400">
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