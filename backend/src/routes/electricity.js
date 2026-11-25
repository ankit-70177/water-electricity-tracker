
const express = require('express');
const router = express.Router();

const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { isValidAmount, isValidDate } = require('../utils/validators');

// Add electricity consumption
router.post('/', authenticateToken, async (req, res) => {
  const { amount, usage_date } = req.body;

  if (!isValidAmount(amount)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid positive electricity amount.',
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
      `INSERT INTO electricity_usage (user_id, amount, usage_date)
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
      message: 'Electricity usage added successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Add electricity usage error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to add electricity usage.',
    });
  }
});

// Get today's electricity consumption (India timezone)
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_usage
       FROM electricity_usage
       WHERE user_id = $1
       AND usage_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      totalUsage: Number(result.rows[0].total_usage),
    });
  } catch (error) {
    console.error('Fetch today electricity usage error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch electricity usage.',
    });
  }
});

// Get electricity consumption history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, amount,
              TO_CHAR(usage_date, 'YYYY-MM-DD') AS usage_date,
              created_at
       FROM electricity_usage
       WHERE user_id = $1
       ORDER BY usage_date DESC, created_at DESC`,
      [req.user.userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Fetch electricity history error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch electricity history.',
    });
  }
});

module.exports = router;
