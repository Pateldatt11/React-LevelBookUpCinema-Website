const STORAGE_KEY = 'levelbookup-movie-availability';

export const MOVIE_CAPACITY = 100;
export const SOLD_OUT_RESET_DELAY_MS = 2 * 60 * 1000;
export const RESET_NOTIFY_WINDOW_MS = 15 * 1000;

const now = () => Date.now();

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const loadState = () => {
  if (typeof window === 'undefined') return {};
  return safeParse(localStorage.getItem(STORAGE_KEY) || '{}', {});
};

const persistState = (state) => {
  if (typeof window === 'undefined') return state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
};

export const getMovieAvailability = (movieKey) => loadState()[movieKey] || null;

export const setMovieAvailability = (movieKey, availability) => {
  const next = loadState();
  next[movieKey] = availability;
  return persistState(next)[movieKey];
};

export const patchMovieAvailability = (movieKey, updater) => {
  const current = getMovieAvailability(movieKey);
  const updated = updater(current);
  const next = loadState();

  if (updated) {
    next[movieKey] = updated;
  } else {
    delete next[movieKey];
  }

  persistState(next);
  return updated || null;
};

export const markMovieSoldOut = (movieKey, resetAt = now() + SOLD_OUT_RESET_DELAY_MS) => setMovieAvailability(movieKey, {
  status: 'sold-out',
  resetAt,
  notified: false,
  createdAt: now(),
});

export const clearMovieAvailability = (movieKey) => patchMovieAvailability(movieKey, () => null);

export const getMovieResetCountdown = (movieKey) => {
  const availability = getMovieAvailability(movieKey);
  if (!availability || availability.status !== 'sold-out') return 0;
  return Math.max(0, availability.resetAt - now());
};
