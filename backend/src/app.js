const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Water & Electricity Tracker API is running 🚀',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is healthy',
  });
});

module.exports = app;