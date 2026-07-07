import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './Payment.css';
import { confirmSeats, getMovieSeatKey } from '../utils/seatReservations';
import { AuthContext } from '../context/AuthContext';
import { buildApiUrl, getEmailJsPublicKey, getEmailJsServiceId, getEmailJsTemplateId, getRazorpayKeyId } from '../utils/runtimeConfig';

const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (typeof window === 'undefined') {
    reject(new Error('Payment checkout is unavailable in this environment.'));
    return;
  }

  if (window.Razorpay) {
    resolve(window.Razorpay);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = true;
  script.dataset.razorpayCheckout = 'true';
  script.onload = () => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
    } else {
      reject(new Error('Razorpay checkout failed to load.'));
    }
  };
  script.onerror = () => reject(new Error('Razorpay checkout failed to load.'));
  document.body.appendChild(script);
});

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, selectedSeats = [], totalAmount = 0, reservationOwnerId, movieKey: incomingMovieKey, showEndAt = null } = location.state || {};
  const movieKey = incomingMovieKey || getMovieSeatKey(movie);
  const [method, setMethod] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketPhotos, setTicketPhotos] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { user, redeemVoucher, updateProfile } = useContext(AuthContext);
  const razorpayKeyId = getRazorpayKeyId();

  const showTime = location.state?.showTime || movie?.showTime || new Date().toLocaleString();
  const screen = location.state?.screen || 'Screen 1';
  const bookingCreatedAt = new Date().toISOString();
  const paymentMethod = method;
  const ownerFullName = user?.name || user?.username || '';
  const ownerEmail = user?.email || '';
  const ownerPhone = user?.phone || '';
  const ownerDob = user?.dob || '';

  useEffect(() => {
    if (!movie) {
      navigate('/movies', { replace: true });
    }
  }, [movie, navigate]);

  if (!movie) {
    return null;
  }

  const availableVoucher = user?.vouchers?.find((voucher) => !voucher.redeemed);

  const parseSeat = (seat) => {
    const row = seat.slice(0, 1);
    const seatNumber = Number(seat.slice(1));
    return { row, seatNumber };
  };

  const coupleSeats = new Set(['E5', 'E6', 'F5', 'F6']);
  const diningSeats = new Set(['D1', 'D2', 'D3', 'D4']);

  const getSeatTier = (row, seatNumber) => {
    const seatId = `${row}${seatNumber}`;
    if (diningSeats.has(seatId)) return 'dining';
    if (coupleSeats.has(seatId)) return 'couple';
    if (['G', 'H', 'I', 'J'].includes(row)) return 'premium';
    return 'standard';
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

  const computeDiscountForPrice = (price) => {
    if (!availableVoucher) return 0;
    const discount = Math.round((price * (availableVoucher.percent || 0)) / 100);
    return Math.min(discount, availableVoucher.cap || Infinity);
  };

  const breakdown = selectedSeats.map((seat) => {
    const price = getSeatPrice(seat);
    const discount = computeDiscountForPrice(price);
    return { seat, price, discount, final: price - discount };
  });

  const discountedTotal = breakdown.reduce((sum, item) => sum + item.final, 0);
  const totalPayable = availableVoucher ? discountedTotal : totalAmount;
  const paymentModeLabel = razorpayKeyId ? 'Razorpay checkout' : 'Local confirmation mode';

  const sendBookingConfirmationEmail = async (booking) => {
    const serviceId = getEmailJsServiceId();
    const templateId = getEmailJsTemplateId();
    const publicKey = getEmailJsPublicKey();

    if (!serviceId || !templateId || !publicKey || !booking?.movie) {
      return false;
    }

    const emailMessage = [
      'Your ticket is confirmed',
      `Booking ID: ${booking.id}`,
      `Movie: ${booking.movie.title}`,
      `Showtime: ${booking.showTime}`,
      `Screen: ${booking.screen}`,
      `Name: ${booking.ownerFullName || user?.name || ''}`,
      `Email: ${booking.ownerEmail || user?.email || ''}`,
      `Phone: ${booking.ownerPhone || user?.phone || ''}`,
      `Seats: ${(booking.seats || []).join(', ')}`,
      `Total Paid: ₹${booking.amount}`,
      `Payment Method: ${booking.paymentMethod || 'wallet'}`,
      '',
      'Regards, LevelBookUp Cinema',
    ].join('\n');

    const templateParams = {
      to_email: booking.ownerEmail || user?.email || '',
      to_name: booking.ownerFullName || user?.name || '',
      user_email: booking.ownerEmail || user?.email || '',
      recipient_email: booking.ownerEmail || user?.email || '',
      email: booking.ownerEmail || user?.email || '',
      booking_id: booking.id,
      bookingId: booking.id,
      movie_title: booking.movie.title,
      movieTitle: booking.movie.title,
      showtime: booking.showTime,
      show_time: booking.showTime,
      screen: booking.screen,
      owner_full_name: booking.ownerFullName || user?.name || '',
      owner_email: booking.ownerEmail || user?.email || '',
      owner_phone: booking.ownerPhone || user?.phone || '',
      seats: (booking.seats || []).join(', '),
      total_paid: `₹${booking.amount}`,
      totalAmount: booking.amount,
      payment_method: booking.paymentMethod || 'wallet',
      paymentMethod: booking.paymentMethod || 'wallet',
      message: emailMessage,
      html_message: emailMessage.replace(/\n/g, '<br/>'),
      subject: 'Your ticket is confirmed',
      title: 'Your ticket is confirmed',
    };

    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return true;
  };

  const requestJson = async (path, options = {}) => {
    const response = await fetch(buildApiUrl(path), options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error((data && data.message) || 'Request failed');
    }

    return data;
  };

  const persistBooking = async (paymentRef = {}) => {
    const booking = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      movie: { id: movie.id, title: movie.title, img: movie.img || movie.image || movie.poster },
      seats: selectedSeats,
      amount: totalPayable,
      showTime,
      screen,
      movieKey,
      photos: ticketPhotos || [],
      payment: paymentRef,
      paymentMethod,
      ownerFullName,
      ownerEmail,
      ownerPhone,
      ownerDob,
      bookingCreatedAt,
      bookedBy: user?.email || 'guest',
      showEndAt,
    };

    const saved = await requestJson('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });

    try {
      await sendBookingConfirmationEmail(booking);
    } catch (emailErr) {
      console.error('Booking email failed', emailErr);
    }

    confirmSeats({ movieKey, seats: selectedSeats, holderId: reservationOwnerId, expiresAt: saved?.booking?.expiresAt });

    if (availableVoucher && !availableVoucher.redeemed && redeemVoucher) {
      redeemVoucher(availableVoucher.id);
    }

    try {
      const currentBookings = Array.isArray(user?.bookings) ? user.bookings : [];
      updateProfile({ bookings: [booking, ...currentBookings] });
    } catch {
      // ignore profile sync failures
    }

    return saved?.booking || booking;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    if (!selectedSeats.length) {
      setErrorMessage('Please select at least one seat before paying.');
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setErrorMessage('Please log in before confirming the booking.');
      setIsSubmitting(false);
      return;
    }

    try {
      setStatusMessage('Creating payment order...');
      const order = await requestJson('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPayable, receipt: `${movieKey}-${Date.now()}` }),
      });

      if (razorpayKeyId && order?.orderId) {
        setStatusMessage('Opening Razorpay checkout...');
        const Razorpay = await loadRazorpayCheckout();

        const booking = await new Promise((resolve, reject) => {
          const checkout = new Razorpay({
            key: razorpayKeyId,
            amount: Math.max(1, Math.round(totalPayable * 100)),
            currency: order.currency || 'INR',
            name: 'LevelBookUp Cinema',
            description: `${movie.title} booking`,
            order_id: order.orderId,
            prefill: {
              name: user?.name || '',
              email: user?.email || '',
              contact: user?.phone || '',
            },
            notes: {
              movieTitle: movie.title,
              movieKey,
              seats: selectedSeats.join(','),
            },
            theme: { color: '#e50914' },
            handler: async (response) => {
              try {
                const finalized = await persistBooking({
                  gateway: 'razorpay',
                  orderId: order.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                });
                resolve(finalized);
              } catch (bookingErr) {
                reject(bookingErr);
              }
            },
          });

          checkout.on('payment.failed', (response) => {
            reject(new Error(response?.error?.description || 'Payment failed'));
          });

          checkout.open();
        });

        setStatusMessage('Booking confirmed. Redirecting to ticket...');
        navigate('/ticket', {
          state: {
            movie,
            selectedSeats,
            totalAmount: totalPayable,
            movieKey,
            reservationOwnerId,
            showTime,
            screen,
            photos: ticketPhotos,
            bookingId: booking.id,
            ownerFullName,
            ownerEmail,
            ownerPhone,
            ownerDob,
            paymentMethod,
            bookingCreatedAt,
            ticketBoughtAt: bookingCreatedAt,
          },
        });
        return;
      }

      setStatusMessage('Gateway key not configured, using local confirmation mode.');
      const booking = await persistBooking({
        gateway: 'mock',
        orderId: order?.orderId || `${movieKey}-${Date.now()}`,
      });

      setStatusMessage('Booking confirmed. Redirecting to ticket...');
      navigate('/ticket', {
        state: {
          movie,
          selectedSeats,
          totalAmount: totalPayable,
          movieKey,
          reservationOwnerId,
          showTime,
          screen,
          photos: ticketPhotos,
          bookingId: booking.id,
          ownerFullName,
          ownerEmail,
          ownerPhone,
          ownerDob,
          paymentMethod,
          bookingCreatedAt,
          ticketBoughtAt: bookingCreatedAt,
        },
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTicketPhotos((state) => [ev.target.result, ...state].slice(0, 2));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="payment-page page-shell page-fade-in">
      <section className="payment-hero">
        <div className="hero-overlay" />
        <div className="payment-content">
          <h1 className="payment-title">Complete <span className="highlight">Payment</span></h1>
          <p className="payment-subtitle">Confirm your booking and lock your seats in a few seconds.</p>
        </div>
        <div className="hero-glow" />
      </section>

      <section className="payment-section">
        <div className="payment-grid">
          <div className="payment-card summary-card">
            <div className="card-header-row">
              <div>
                <p className="card-kicker">Booking summary</p>
                <h2>{movie.title}</h2>
              </div>
              <span className="secure-pill">Secure checkout</span>
            </div>

            <div className="movie-quick-info">
              <div>
                <span>Showtime</span>
                <strong>{showTime}</strong>
              </div>
              <div>
                <span>Screen</span>
                <strong>{screen}</strong>
              </div>
              <div>
                <span>Seats</span>
                <strong>{selectedSeats.length}</strong>
              </div>
            </div>

            <div className="ticket-summary-list">
              {breakdown.map((item) => (
                <div key={item.seat} className="ticket-summary-row">
                  <div className="ticket-seat-pill">{item.seat}</div>
                  <div className="ticket-price-stack">
                    <span>Base price ₹{item.price}</span>
                    {item.discount > 0 ? <small>Discount -₹{item.discount}</small> : null}
                  </div>
                  <strong>₹{item.final}</strong>
                </div>
              ))}
            </div>

            <div className="summary-total-box">
              <span>Total payable</span>
              <strong>₹{totalPayable}</strong>
            </div>

            <div className="summary-tags">
              <span>Instant booking</span>
              <span>Refund-safe flow</span>
              <span>Seats locked on confirm</span>
            </div>
          </div>

          <form className="payment-card payment-form" onSubmit={handleConfirm}>
            <div className="card-header-row">
              <div>
                <p className="card-kicker">Payment method</p>
                <h2>Secure checkout</h2>
              </div>
              <span className="secure-pill method-pill">{paymentModeLabel}</span>
            </div>

            <p className="payment-method-note">Choose your preferred method below. The checkout feels native, polished, and ready for a real booking flow.</p>

            <div className="payment-status" aria-live="polite">
              <span>{paymentModeLabel}</span>
              {statusMessage ? <strong>{statusMessage}</strong> : null}
            </div>

            {errorMessage ? <div className="payment-error" role="alert">{errorMessage}</div> : null}

            <div className="method-grid">
              <button type="button" className={method === 'upi' ? 'method-chip active' : 'method-chip'} onClick={() => setMethod('upi')}>
                <span>UPI</span>
                <small>Fast scan & pay</small>
              </button>
              <button type="button" className={method === 'card' ? 'method-chip active' : 'method-chip'} onClick={() => setMethod('card')}>
                <span>Card</span>
                <small>Visa / Mastercard</small>
              </button>
              <button type="button" className={method === 'wallet' ? 'method-chip active' : 'method-chip'} onClick={() => setMethod('wallet')}>
                <span>Wallet</span>
                <small>Quick balance pay</small>
              </button>
            </div>

            <label className="upload-block">
              <span>Add up to 2 photos for your ticket (optional)</span>
              <div className="upload-row">
                <label className="file-drop">
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files && e.target.files[0]; if (file) handlePhotoFile(file); }} />
                  Upload Photo
                </label>
                <div className="photo-preview-list">
                  {ticketPhotos.map((photo, idx) => <img key={idx} src={photo} alt={`ticket-${idx}`} className="photo-preview" />)}
                </div>
              </div>
            </label>

            <div className="payment-fields">
              <label>
                <span>{method === 'card' ? 'Card Number' : 'UPI ID'}</span>
                <input type="text" placeholder={method === 'card' ? '1234 5678 9012 3456' : 'name@upi'} required />
              </label>

              <label>
                <span>{method === 'card' ? 'Expiry' : 'Mobile Number'}</span>
                <input type="text" placeholder={method === 'card' ? 'MM/YY' : '10-digit mobile'} required />
              </label>
            </div>

            <div className="payment-fineprint">
              <span>Encrypted checkout</span>
              <span>Instant receipt</span>
              <span>Professional payment handoff</span>
            </div>

            <button type="submit" className="confirm-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : `Pay ₹${totalPayable}`}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Payment;
