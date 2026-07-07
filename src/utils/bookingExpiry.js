const DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseRuntimeMinutes = (runtime) => {
  if (typeof runtime !== 'string') return null;

  const hoursMatch = runtime.match(/(\d+)\s*h/i);
  const minutesMatch = runtime.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

  const totalMinutes = (hours * 60) + minutes;
  return totalMinutes > 0 ? totalMinutes : null;
};

const parseShowTimeToDate = (showTime, referenceDate = new Date()) => {
  if (typeof showTime !== 'string' || !showTime.trim()) return null;

  const match = showTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'AM') {
    if (hours === 12) hours = 0;
  } else if (hours !== 12) {
    hours += 12;
  }

  const date = new Date(referenceDate);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

export const getShowEndAt = ({ showTime, runtime, referenceDate = new Date() } = {}) => {
  const showStartAt = parseShowTimeToDate(showTime, referenceDate);
  const runtimeMinutes = parseRuntimeMinutes(runtime);

  if (!showStartAt || !runtimeMinutes) return null;
  return showStartAt + (runtimeMinutes * 60 * 1000);
};

export const getBookingExpiryAt = ({ createdAt, expiresAt, showEndAt } = {}) => {
  const candidates = [];
  const createdTimestamp = Number(createdAt);
  const explicitExpiry = Number(expiresAt);
  const showEndTimestamp = Number(showEndAt);

  if (Number.isFinite(createdTimestamp) && createdTimestamp > 0) {
    candidates.push(createdTimestamp + DAY_IN_MS);
  }

  if (Number.isFinite(explicitExpiry) && explicitExpiry > 0) {
    candidates.push(explicitExpiry);
  }

  if (Number.isFinite(showEndTimestamp) && showEndTimestamp > 0) {
    candidates.push(showEndTimestamp);
  }

  if (!candidates.length) {
    return Date.now() + DAY_IN_MS;
  }

  return Math.min(...candidates);
};

export const isBookingActive = (booking, referenceTime = Date.now()) => {
  const expiryAt = getBookingExpiryAt(booking);
  return Number.isFinite(expiryAt) && expiryAt > referenceTime;
};
