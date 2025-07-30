// index.js
const pool = require('./db.js'); 
// Import required packages
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // This loads the variables from .env

// Initialize the express app
const app = express();

// Define the port
// It will use the PORT from your .env file, or 5000 if it's not defined
const PORT = process.env.PORT || 5000;

// Apply middleware
const cors = require('cors');

// ... your other code

app.use(cors({
  origin: 'https://copy-job-tracker-rxlk.vercel.app' 
})); // Allows requests from your frontend
app.use(express.json()); // Allows the server to accept and parse JSON in request bodies

// A simple test route to make sure the server is working
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/ai', require('./routes/ai'));
app.get('/', (req, res) => {
  res.send('Hello from the AI Job Tracker backend!');
});

// Make the server listen for requests
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});