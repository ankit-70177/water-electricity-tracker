// Shared input validation helpers for consumption routes

const isValidAmount = (amount) => {
  if (
    amount === null ||
    amount === undefined ||
    typeof amount === 'boolean' ||
    typeof amount === 'object' ||
    String(amount).trim() === ''
  ) {
    return false;
  }

  return Number.isFinite(Number(amount)) && Number(amount) > 0;
};

// Optional: if provided, must be a valid YYYY-MM-DD calendar date
const isValidDate = (dateStr) => {
  if (dateStr === undefined) {
    return true;
  }

  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));

  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day
  );
};

module.exports = { isValidAmount, isValidDate };
