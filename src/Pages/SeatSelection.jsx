import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SeatSelection.css'; 

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie } = location.state || {}; 

  const [selectedSeats, setSelectedSeats] = useState([]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;
  const allSeats = rows.flatMap(row => 
    Array.from({ length: seatsPerRow }, (_, i) => `${row}${i + 1}`)
  );

  
  const bookedSeats = ['A3', 'A4', 'B7', 'C2', 'D5', 'E8', 'F1', 'G9'];

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return; 
    setSelectedSeats(prev => 
      prev.includes(seat) 
        ? prev.filter(s => s !== seat) 
        : [...prev, seat]
    );
  };

  const totalPrice = selectedSeats.length * (movie?.price.replace('₹', '') || 300); 

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Minimum 1 seat select ');
      return;
    }
    navigate('/payment', { 
      state: { 
        movie, 
        selectedSeats, 
        totalAmount: totalPrice 
      } 
    });
  };

  return (
    <div className="seat-page">
      <h1 className="seat-title">{movie?.title || 'Movie'} - Seat Selection</h1>
      <p className="seat-subtitle">Choose Seat</p>

      <div className="screen">SCREEN </div>

      <div className="seat-grid">
        {rows.map(row => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            {Array.from({ length: seatsPerRow }, (_, i) => {
              const seat = `${row}${i + 1}`;
              const isBooked = bookedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              return (
                <div
                  key={seat}
                  className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isBooked && toggleSeat(seat)}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="legend">
        <div><span className="available"></span> Available</div>
        <div><span className="selected"></span> Selected</div>
        <div><span className="booked"></span> Booked</div>
      </div>

      <div className="summary">
        <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
        <p>Total: ₹{totalPrice}</p>
        <button className="proceed-btn" onClick={handleProceed}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;