const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getBookingExpiryAt = ({ createdAt, expiresAt, showEndAt } = {}) => {
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

module.exports = { getBookingExpiryAt };
