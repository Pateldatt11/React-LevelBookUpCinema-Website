const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getBookingExpiryAt } = require('./bookingExpiry');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'bookings.json');
const USERS_FILE = path.join(__dirname, 'users.json');

const razorpayClient = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const readJsonFile = (filePath, fallback) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJsonFile = (filePath, value) => fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');

const readBookings = () => readJsonFile(DATA_FILE, []);
const writeBookings = (b) => writeJsonFile(DATA_FILE, b);
const readUsers = () => readJsonFile(USERS_FILE, []);
const writeUsers = (u) => writeJsonFile(USERS_FILE, u);

const isValidEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPassword = (value) => typeof value === 'string' && value.trim().length >= 6;
const normalizeSeats = (seats) => Array.isArray(seats) ? seats.map((seat) => String(seat).trim()).filter(Boolean) : [];

const sanitizeBooking = (booking) => ({
  id: booking.id || `bk_${Date.now()}`,
  movie: booking.movie || {},
  movieKey: booking.movieKey || booking.movie?.id || booking.movie?.title || 'default',
  seats: normalizeSeats(booking.seats),
  amount: Number(booking.amount) || 0,
  showTime: booking.showTime || '',
  screen: booking.screen || 'Screen 1',
  photos: Array.isArray(booking.photos) ? booking.photos : [],
  payment: booking.payment || {},
  bookedBy: booking.bookedBy || '',
  createdAt: booking.createdAt || Date.now(),
  updatedAt: booking.updatedAt || booking.createdAt || Date.now(),
  showEndAt: booking.showEndAt || null,
  expiresAt: booking.expiresAt || null,
});

const isBookingActive = (booking, referenceTime = Date.now()) => getBookingExpiryAt(booking) > referenceTime;

const sweepExpiredBookings = () => {
  const bookings = readBookings().map(sanitizeBooking);
  const activeBookings = bookings.filter((booking) => isBookingActive(booking));

  if (activeBookings.length !== bookings.length) {
    writeBookings(activeBookings);
  }

  return activeBookings;
};

const conflictExists = (bookings, booking) => bookings.some((existing) => {
  if (existing.id === booking.id) return false;
  if (existing.movieKey !== booking.movieKey) return false;
  if ((existing.showTime || '') !== (booking.showTime || '')) return false;
  if ((existing.screen || '') !== (booking.screen || '')) return false;

  const existingSeats = new Set(normalizeSeats(existing.seats));
  return normalizeSeats(booking.seats).some((seat) => existingSeats.has(seat));
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, ok: true });
});

app.post('/api/create-order', (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body || {};
  const amountInPaise = Math.max(1, Math.round((Number(amount) || 0) * 100));

  if (razorpayClient) {
    razorpayClient.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    }).then((order) => {
      res.json({
        orderId: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        receipt: order.receipt,
        gateway: 'razorpay',
      });
    }).catch((err) => {
      res.status(500).json({ success: false, message: err.message || 'Unable to create Razorpay order' });
    });
    return;
  }

  const orderId = `order_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
  res.json({ orderId, amount: Number(amount) || 0, currency, receipt, gateway: 'mock' });
});

app.post('/api/confirm', (req, res) => {
  const booking = sanitizeBooking(req.body || {});
  const bookingExpiryAt = getBookingExpiryAt(booking);

  if (!booking.movieKey || booking.seats.length === 0) {
    return res.status(400).json({ success: false, message: 'movieKey and seats are required' });
  }

  if (bookingExpiryAt <= Date.now()) {
    return res.status(400).json({ success: false, message: 'Selected show has already ended' });
  }

  const bookings = sweepExpiredBookings();

  if (conflictExists(bookings, booking)) {
    return res.status(409).json({ success: false, message: 'One or more seats were already booked by another request' });
  }

  // If this booking claims it was paid through Razorpay, verify the payment signature
  try {
    const payment = booking.payment || {};
    if (payment.gateway === 'razorpay') {
      const { orderId, paymentId, signature } = payment;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ success: false, message: 'Missing Razorpay payment details' });
      }

      if (!secret) {
        return res.status(500).json({ success: false, message: 'Server not configured with Razorpay secret' });
      }

      const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
      if (expected !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid Razorpay signature' });
      }
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error verifying payment' });
  }

  const nextBookings = [
    ...bookings.filter((item) => item.id !== booking.id),
    {
      ...booking,
      createdAt: booking.createdAt || Date.now(),
      updatedAt: Date.now(),
      showEndAt: booking.showEndAt || null,
      expiresAt: bookingExpiryAt,
    },
  ];

  writeBookings(nextBookings);
  res.json({ success: true, booking: nextBookings.find((item) => item.id === booking.id) });
});

// Webhook endpoint to receive Razorpay events (optional)
app.post('/api/webhook', express.raw({ type: '*/*' }), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!secret) {
    return res.status(400).json({ success: false, message: 'Webhook secret not configured' });
  }

  const generated = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (generated !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  try {
    const event = JSON.parse(req.body.toString('utf8'));
    console.log('Received Razorpay webhook event:', event.event);
    // TODO: handle events (payment.captured, payment.failed, refund.*) and reconcile bookings
  } catch (e) {
    // ignore parse errors
  }

  res.json({ success: true });
});

app.get('/api/bookings', (req, res) => res.json(sweepExpiredBookings()));

app.post('/api/register', (req, res) => {
  const body = req.body || {};
  const users = readUsers();

  if (!isValidEmail(body.email)) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }

  if (!isValidPassword(body.password)) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  if (users.find((u) => u.email === body.email)) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const voucher = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: 'percent',
    percent: 15,
    cap: 500,
    redeemed: false,
    issuedAt: Date.now(),
  };

  const hashed = bcrypt.hashSync(body.password, 10);

  const newUser = {
    name: body.name || '',
    username: body.username || '',
    email: body.email || '',
    password: hashed,
    phone: body.phone || '',
    address: body.address || '',
    city: body.city || '',
    state: body.state || '',
    dob: body.dob || '',
    profileImage: body.profileImage || '',
    joinedAt: Date.now(),
    vouchers: [voucher],
    bookings: [],
  };

  users.push(newUser);
  writeUsers(users);

  const safe = { ...newUser };
  delete safe.password;
  res.json({ success: true, user: safe });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ success: false, message: 'Valid email and password are required' });
  }

  const users = readUsers();
  const found = users.find((u) => u.email === email);
  if (!found) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, found.password || '');
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const safe = { ...found };
  delete safe.password;
  res.json({ success: true, user: safe });
});

app.get('/api/me', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ success: false, message: 'email required' });
  const users = readUsers();
  const found = users.find((u) => u.email === email);
  if (!found) return res.status(404).json({ success: false, message: 'Not found' });

  const safe = { ...found };
  delete safe.password;
  res.json({ success: true, user: safe });
});

app.put('/api/me', (req, res) => {
  const { email, currentEmail, ...updates } = req.body || {};
  const targetEmail = currentEmail || email;

  if (!isValidEmail(targetEmail)) {
    return res.status(400).json({ success: false, message: 'currentEmail is required' });
  }

  const users = readUsers();
  const index = users.findIndex((u) => u.email === targetEmail);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  if (email && email !== targetEmail) {
    const emailTaken = users.some((u, userIndex) => userIndex !== index && u.email === email);
    if (emailTaken) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
  }

  const nextUser = {
    ...users[index],
    ...updates,
  };

  if (email) {
    nextUser.email = email;
  }

  users[index] = nextUser;
  writeUsers(users);

  const safe = { ...nextUser };
  delete safe.password;
  res.json({ success: true, user: safe });
});

app.listen(PORT, () => console.log(`Mock server listening on http://localhost:${PORT}`));

setInterval(() => {
  try {
    sweepExpiredBookings();
  } catch {
    // ignore cleanup failures
  }
}, 5 * 60 * 1000).unref?.();
