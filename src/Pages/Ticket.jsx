import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toDataURL } from 'qrcode/lib/browser';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Ticket.css';

const Ticket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    movie,
    selectedSeats = [],
    totalAmount = 0,
    showTime,
    screen,
    photos = [],
    bookingId,
    ownerFullName = '',
    ownerEmail = '',
    ownerPhone = '',
    ownerDob = '',
    paymentMethod = '',
    bookingCreatedAt = '',
    ticketBoughtAt = '',
  } = location.state || {};

  const [qrSrc, setQrSrc] = useState('');
  const ticketRef = useRef(null);

  if (!movie) {
    // if opened directly, redirect to movies
    navigate('/movies', { replace: true });
    return null;
  }

  useEffect(() => {
    const id = bookingId || `${movie.id || movie.title}-${Date.now()}`;
    const payload = JSON.stringify({ id, movie: movie.id || movie.title, seats: selectedSeats });
    toDataURL(payload, { margin: 1, width: 220 }).then(setQrSrc).catch(() => setQrSrc(''));
  }, [bookingId, movie, selectedSeats]);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ticket-${bookingId || Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(bookingId || '');
      alert('Booking ID copied to clipboard');
    } catch (err) {
      alert('Unable to copy');
    }
  };

  const seatList = selectedSeats.join(', ');
  const buyTimestamp = ticketBoughtAt || bookingCreatedAt || new Date().toISOString();
  const showDateTime = showTime || movie.showTime || 'N/A';
  const buyDateTime = new Date(buyTimestamp).toLocaleString();

  return (
    <div className="ticket-page page-shell page-fade-in">
      <div className="ticket-card" ref={ticketRef}>
        <div className="ticket-left">
          <img src={movie.image || movie.poster || movie.img || '/assets/movie-placeholder.png'} alt={movie.title} />
        </div>
        <div className="ticket-right">
          <h1 className="ticket-title">{movie.title}</h1>
          <div className="ticket-meta-grid">
            <div className="ticket-meta-item"><span>Owner</span><strong>{ownerFullName || 'Guest User'}</strong></div>
            <div className="ticket-meta-item"><span>Email</span><strong>{ownerEmail || 'N/A'}</strong></div>
            <div className="ticket-meta-item"><span>Phone</span><strong>{ownerPhone || 'N/A'}</strong></div>
            <div className="ticket-meta-item"><span>DOB</span><strong>{ownerDob || 'N/A'}</strong></div>
          </div>
          {photos && photos.length > 0 ? (
            <div className="ticket-user-photos">
              {photos.map((p, i) => (
                <img key={i} src={p} alt={`user-photo-${i}`} className="ticket-user-photo" />
              ))}
            </div>
          ) : null}
          <div className="ticket-row"><span>Show Date & Time</span><strong>{showDateTime}</strong></div>
          <div className="ticket-row"><span>Ticket Buy Date & Time</span><strong>{buyDateTime}</strong></div>
          <div className="ticket-row"><span>Screen</span><strong>{screen || 'Screen 1'}</strong></div>
          <div className="ticket-row"><span>Seats</span><strong>{seatList}</strong></div>
          <div className="ticket-row"><span>Payment Method</span><strong>{paymentMethod || 'Razorpay / Local'}</strong></div>
          <div className="ticket-row"><span>Price</span><strong>₹{totalAmount}</strong></div>
          {bookingId ? <div className="ticket-row"><span>Booking ID</span><strong>{bookingId}</strong></div> : null}

          {qrSrc ? (
            <div style={{ marginTop: 12 }}>
              <img src={qrSrc} alt="booking-qr" style={{ width: 140, height: 140, borderRadius: 8 }} />
            </div>
          ) : null}

          <div className="ticket-actions">
            <button className="download-btn" onClick={() => window.print()}>Print / Save</button>
            <button className="download-btn" onClick={handleDownloadPDF}>Download PDF</button>
            {bookingId ? <button className="download-btn" onClick={handleCopyId}>Copy ID</button> : null}
            <button className="back-btn" onClick={() => navigate('/movies')}>Back to Movies</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
