
const express = require('express');
const cors = require('cors');

// Create Express app FIRST
const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const waterRoutes = require('./routes/water');
const electricityRoutes = require('./routes/electricity');

// Middleware
app.use(cors());
app.use(express.json());

// Handle malformed JSON requests
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload.',
    });
  }
  next(err);
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/electricity', electricityRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Water & Electricity Tracker API is running 🚀',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is healthy',
  });
});

module.exports = app;
