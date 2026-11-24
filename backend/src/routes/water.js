
const express = require('express');
const router = express.Router();

const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Validate consumption amount
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

// Validate usage date (optional: if provided, must be a valid YYYY-MM-DD string)
const isValidDate = (dateStr) => {
  if (dateStr === undefined) {
    return true; // Optional: defaults to current date in India timezone
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

// Add water consumption
router.post('/', authenticateToken, async (req, res) => {
  const { amount, usage_date } = req.body;

  if (!isValidAmount(amount)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid positive water amount.',
    });
  }

  if (!isValidDate(usage_date)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid usage date in YYYY-MM-DD format.',
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO water_usage (user_id, amount, usage_date)
       VALUES (
         $1,
         $2,
         COALESCE($3::date, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date)
       )
       RETURNING id, user_id, amount,
                 TO_CHAR(usage_date, 'YYYY-MM-DD') AS usage_date,
                 created_at`,
      [req.user.userId, Number(amount), usage_date || null]
    );

    res.status(201).json({
      success: true,
      message: 'Water usage added successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add water usage error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to add water usage.',
    });
  }
});

// Get today's water consumption (India timezone)
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_usage
       FROM water_usage
       WHERE user_id = $1
       AND usage_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      totalUsage: Number(result.rows[0].total_usage),
    });
  } catch (error) {
    console.error("Fetch today's water usage error:", error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch water usage.',
    });
  }
});

// Get water consumption history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, amount,
              TO_CHAR(usage_date, 'YYYY-MM-DD') AS usage_date,
              created_at
       FROM water_usage
       WHERE user_id = $1
       ORDER BY usage_date DESC, created_at DESC`,
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Fetch water history error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch water history.',
    });
  }
});

module.exports = router;
