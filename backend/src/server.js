require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');

    console.log('PostgreSQL database connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

startServer();