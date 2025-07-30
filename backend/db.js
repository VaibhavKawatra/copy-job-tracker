// db.js

const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool to manage connections to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test the connection
pool.connect((err) => {
  if (err) {
    return console.error('Error connecting to the database:', err.stack);
  }
  console.log('✅ Successfully connected to PostgreSQL database!');
});

module.exports = pool;