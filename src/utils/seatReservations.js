const STORAGE_KEY = 'levelbookup-seat-reservations';
const HOLD_DURATION_MS = 2 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const now = () => Date.now();

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const createSeatSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${now()}-${Math.random().toString(16).slice(2)}`;
};

export const getMovieSeatKey = (movie) => movie?.id ?? movie?.title ?? movie?.name ?? 'default';

const getReservationExpiryAt = (reservation) => {
  const createdAt = Number(reservation?.createdAt);
  const expiresAt = Number(reservation?.expiresAt);
  const showEndAt = Number(reservation?.showEndAt);
  const candidates = [];

  if (Number.isFinite(createdAt) && createdAt > 0) candidates.push(createdAt + DAY_IN_MS);
  if (Number.isFinite(expiresAt) && expiresAt > 0) candidates.push(expiresAt);
  if (Number.isFinite(showEndAt) && showEndAt > 0) candidates.push(showEndAt);

  return candidates.length ? Math.min(...candidates) : Date.now() + DAY_IN_MS;
};

const isReservationActive = (reservation) => {
  if (reservation.status === 'booked') {
    return getReservationExpiryAt(reservation) > now();
  }

  return reservation.expiresAt && reservation.expiresAt > now();
};

export const loadSeatReservations = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = safeParse(localStorage.getItem(STORAGE_KEY) || '[]', []);
  const active = stored.filter(isReservationActive);

  if (active.length !== stored.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  }

  return active;
};

const persist = (reservations) => {
  const active = reservations.filter(isReservationActive);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  return active;
};

export const getBookedSeatCount = (movieKey) => loadSeatReservations().filter((reservation) => reservation.movieKey === movieKey && reservation.status === 'booked').length;

export const clearMovieReservations = (movieKey) => {
  const next = loadSeatReservations().filter((reservation) => reservation.movieKey !== movieKey);
  return persist(next);
};

export const holdSeats = ({ movieKey, seats, holderId }) => {
  const currentAll = loadSeatReservations();

  const result = [];

  const requestedSeats = new Set(seats);
  const nowTs = now();

  // Keep reservations for other movies, plus all unmodified seats for this movie.
  currentAll.forEach((r) => {
    if (r.movieKey !== movieKey) {
      result.push(r);
      return;
    }

    if (!requestedSeats.has(r.seat)) {
      result.push(r);
      return;
    }

    if (r.status === 'booked') {
      result.push(r);
      return;
    }

    if (r.expiresAt && r.expiresAt > nowTs && r.holderId !== holderId) {
      result.push(r);
    }
  });

  // For each requested seat, only create/update hold if it's not booked and not held by another active holder
  seats.forEach((seat) => {
    const existing = currentAll.find((reservation) => reservation.movieKey === movieKey && reservation.seat === seat);

    if (existing) {
      if (existing.status === 'booked') {
        // already booked, keep existing and skip creating a hold
        return;
      }

      // existing held reservation
      if (existing.expiresAt && existing.expiresAt > nowTs && existing.holderId !== holderId) {
        // another active holder has this seat, keep existing and skip
        return;
      }

      // either expired or same holder: update/replace
    }

    result.push({
      movieKey,
      seat,
      holderId,
      status: 'held',
      expiresAt: now() + HOLD_DURATION_MS,
      updatedAt: now(),
    });
  });

  return persist(result);
};

export const getReservationsForMovie = (movieKey) => loadSeatReservations().filter((r) => r.movieKey === movieKey);

export const releaseSeats = ({ movieKey, seats, holderId }) => {
  const next = loadSeatReservations().filter((reservation) => {
    if (reservation.movieKey !== movieKey) {
      return true;
    }

    if (!seats.includes(reservation.seat)) {
      return true;
    }

    return reservation.status === 'booked' || reservation.holderId !== holderId;
  });

  return persist(next);
};

export const confirmSeats = ({ movieKey, seats, holderId, expiresAt, showEndAt }) => {
  const next = loadSeatReservations().map((reservation) => {
    if (reservation.movieKey !== movieKey || !seats.includes(reservation.seat)) {
      return reservation;
    }

    if (holderId && reservation.holderId !== holderId) {
      return reservation;
    }

    return {
      ...reservation,
      status: 'booked',
      expiresAt: Number.isFinite(Number(expiresAt)) ? Number(expiresAt) : reservation.expiresAt,
      showEndAt: Number.isFinite(Number(showEndAt)) ? Number(showEndAt) : reservation.showEndAt,
      updatedAt: now(),
    };
  });

  return persist(next);
};

export const unbookSeats = ({ movieKey, seats }) => {
  const next = loadSeatReservations().filter((reservation) => {
    if (reservation.movieKey !== movieKey) return true;
    if (!seats.includes(reservation.seat)) return true;
    // remove any reservation that matches movieKey and seat (booked or held)
    return false;
  });

  return persist(next);
};