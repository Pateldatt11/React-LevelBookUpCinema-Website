import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './SeatSelection.css';
import {
  createSeatSessionId,
  getMovieSeatKey,
  holdSeats,
  loadSeatReservations,
  releaseSeats,
} from '../utils/seatReservations';
import { buildApiUrl } from '../utils/runtimeConfig';
import { AuthContext } from '../context/AuthContext';
import { isBookingActive } from '../utils/bookingExpiry';

const Seat = React.memo(({ number, seatId, isBooked, isReserved, isSelected, seatTier, onToggle, price }) => {
  const classes = `seat ${seatTier} ${isBooked ? 'booked' : ''} ${isReserved ? 'reserved' : ''} ${isSelected ? 'selected' : ''}`;
  const label = `${seatId} ${seatTier} seat`;
  const title = `${seatId} — ${seatTier.charAt(0).toUpperCase() + seatTier.slice(1)} — ₹${price}`;

  return (
    <div
      role="button"
      tabIndex={isBooked || isReserved ? -1 : 0}
      onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && !isBooked && !isReserved) onToggle(); }}
      onClick={() => { if (!isBooked && !isReserved) onToggle(); }}
      className={classes}
      title={title}
      aria-label={label}
      aria-pressed={isSelected}
      aria-disabled={isBooked || isReserved}
    >
      {number}
    </div>
  );
}, (previousProps, nextProps) => (
  previousProps.isBooked === nextProps.isBooked
  && previousProps.isReserved === nextProps.isReserved
  && previousProps.isSelected === nextProps.isSelected
  && previousProps.price === nextProps.price
));

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showTime = '', screen = 'Screen 1', showEndAt = null } = location.state || {};
  const [sessionId] = useState(() => createSeatSessionId());
  const movieKey = useMemo(() => getMovieSeatKey(movie), [movie]);
  const [reservations, setReservations] = useState(() => loadSeatReservations());
  const [clock, setClock] = useState(() => Date.now());
  const { user } = useContext(AuthContext);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 10;

  useEffect(() => {
    const syncReservations = () => setReservations(loadSeatReservations());

    window.addEventListener('storage', syncReservations);
    const intervalId = window.setInterval(syncReservations, 4000);

    return () => {
      window.removeEventListener('storage', syncReservations);
      window.clearInterval(intervalId);
    };
  }, []);

  const movieReservations = useMemo(() => reservations.filter((reservation) => reservation.movieKey === movieKey), [reservations, movieKey]);
  const bookedSeats = useMemo(() => movieReservations.filter((item) => item.status === 'booked').map((item) => item.seat), [movieReservations]);
  const heldByOthers = useMemo(() => movieReservations.filter((item) => item.status === 'held' && item.holderId !== sessionId).map((item) => item.seat), [movieReservations, sessionId]);
  const selectedSeats = useMemo(() => movieReservations.filter((item) => item.status === 'held' && item.holderId === sessionId).map((item) => item.seat), [movieReservations, sessionId]);

  const nextExpiry = useMemo(() => movieReservations.filter((item) => item.status === 'held' && item.holderId === sessionId).reduce((minExpiry, item) => Math.min(minExpiry, item.expiresAt || Infinity), Infinity), [movieReservations, sessionId]);
  const holdSecondsLeft = Number.isFinite(nextExpiry) ? Math.max(0, Math.ceil((nextExpiry - clock) / 1000)) : 0;

  useEffect(() => {
    if (holdSecondsLeft <= 0) return undefined;
    const clockId = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(clockId);
  }, [holdSecondsLeft]);

  const coupleSeats = new Set(['E5', 'E6', 'F5', 'F6']);
  const diningSeats = new Set(['D1', 'D2', 'D3', 'D4']);

  const getSeatTier = (row, seatNumber) => {
    const seatId = `${row}${seatNumber}`;
    if (diningSeats.has(seatId)) return 'dining';
    if (coupleSeats.has(seatId)) return 'couple';
    if (['G', 'H', 'I', 'J'].includes(row)) return 'premium';
    return 'standard';
  };

  const parseSeat = (seat) => {
    const row = seat.slice(0, 1);
    const seatNumber = Number(seat.slice(1));
    return { row, seatNumber };
  };

  const getSeatPrice = (seat) => {
    const basePrice = Number(movie?.price?.replace('₹', '') || 300);
    const { row, seatNumber } = parseSeat(seat);
    const tier = getSeatTier(row, seatNumber);
    if (tier === 'dining') return Math.round(basePrice * 2.5);
    if (tier === 'premium') return Math.round(basePrice * 1.5);
    if (tier === 'couple') return Math.round(basePrice * 2);
    return basePrice;
  };

  const toggleSeat = useCallback((seat) => {
    if (bookedSeats.includes(seat) || heldByOthers.includes(seat)) return;

    const isSelected = selectedSeats.includes(seat);

    if (isSelected) {
      const next = releaseSeats({ movieKey, seats: [seat], holderId: sessionId });
      setReservations(next);
    } else {
      const next = holdSeats({ movieKey, seats: [seat], holderId: sessionId });
      setReservations(next);
    }
  }, [bookedSeats, heldByOthers, selectedSeats, movieKey, sessionId]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/bookings'));
        if (!res.ok) return;
        const bookings = await res.json();
        if (cancelled) return;

        const remoteBooked = (bookings || [])
          .filter((booking) => booking.movieKey === movieKey && isBookingActive(booking))
          .flatMap((booking) => (booking.seats || []).map((seat) => ({
            movieKey,
            seat,
            status: 'booked',
            expiresAt: booking.expiresAt,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt || Date.now(),
          })));

        const remoteBookedSeats = new Set(remoteBooked.map((item) => item.seat));
        const current = loadSeatReservations();
        const preserved = current.filter((item) => {
          if (item.movieKey !== movieKey) return true;
          if (item.status !== 'held') return false;
          return !remoteBookedSeats.has(item.seat);
        });
        const merged = [
          ...preserved,
          ...remoteBooked,
        ];
        localStorage.setItem('levelbookup-seat-reservations', JSON.stringify(merged));
        setReservations(merged);
      } catch {
        // ignore network errors
      }
    };

    const intervalId = window.setInterval(poll, 10000);
    poll();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [movieKey]);

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  const availableVoucher = user?.vouchers?.find((voucher) => !voucher.redeemed);

  const computeDiscountForPrice = (price) => {
    if (!availableVoucher) return 0;
    const discount = Math.round((price * (availableVoucher.percent || 0)) / 100);
    return Math.min(discount, availableVoucher.cap || Infinity);
  };

  const discountedTotal = selectedSeats.reduce((sum, seat) => {
    const price = getSeatPrice(seat);
    const discount = computeDiscountForPrice(price);
    return sum + (price - discount);
  }, 0);

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Minimum 1 seat select');
      return;
    }

    navigate('/payment', {
      state: {
        movie,
        selectedSeats,
        totalAmount: totalPrice,
        movieKey,
        reservationOwnerId: sessionId,
        showTime,
        screen,
        showEndAt,
      },
    });
  };

  return (
    <div className="seat-page">
      <h1 className="seat-title">{movie?.title || 'Movie'} - Seat Selection</h1>
      <p className="seat-subtitle">Choose Seat</p>

      <div className="summary" style={{ marginBottom: '1.5rem' }}>
        <Link to="/movies" className="proceed-btn" style={{ display: 'inline-block' }}>
          Back to Movies
        </Link>
      </div>

      <div className="seat-live-banner">
        <span>Live sync active</span>
        <span>{selectedSeats.length} selected</span>
        <span>{bookedSeats.length} booked</span>
      </div>

      <div className="screen">SCREEN </div>

      <div className="seat-grid">
        {rows.map((row) => (
          <div key={row} className={`seat-row ${['C', 'D'].includes(row) ? 'premium-row' : ['E', 'F'].includes(row) ? 'couple-row' : 'standard-row'}`}>
            <span className="row-label">{row}</span>
            {Array.from({ length: seatsPerRow }, (_, index) => {
              const seatId = `${row}${index + 1}`;
              return (
                <Seat
                  key={seatId}
                  number={index + 1}
                  seatId={seatId}
                  isBooked={bookedSeats.includes(seatId)}
                  isReserved={heldByOthers.includes(seatId)}
                  isSelected={selectedSeats.includes(seatId)}
                  seatTier={getSeatTier(row, index + 1)}
                  onToggle={() => toggleSeat(seatId)}
                  price={getSeatPrice(seatId)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="legend">
        <div><span className="available"></span> Available</div>
        <div><span className="premium"></span> Premium</div>
        <div><span className="couple"></span> Couple (pair)</div>
        <div><span className="dining"></span> Dining Table</div>
        <div><span className="selected"></span> Selected</div>
        <div><span className="reserved"></span> Live Reserved</div>
        <div><span className="booked"></span> Booked</div>
      </div>

      <div className="summary">
        <p>Selected Seats: {selectedSeats.join(', ') || 'None'}</p>
        <p>
          Total: ₹{availableVoucher ? discountedTotal : totalPrice}
          {availableVoucher ? <span style={{ marginLeft: 8, color: '#9aa' }}>(includes {availableVoucher.percent}% signup discount)</span> : null}
        </p>
        <p>Hold timer: {holdSecondsLeft > 0 ? `${Math.floor(holdSecondsLeft / 60)}:${String(holdSecondsLeft % 60).padStart(2, '0')}` : 'No active hold'}</p>
        <button className="proceed-btn" onClick={handleProceed}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
