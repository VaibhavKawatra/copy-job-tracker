// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user to the database
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// Add this to routes/auth.js

const jwt = require('jsonwebtoken');

// --- LOGIN ROUTE ---
// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // User is validated, now create the JWT
    const payload = {
      user: {
        id: user.rows[0].id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
module.exports = router;