// server.js
const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form-encoded data
app.use(express.urlencoded({ extended: true }));

// Import routes
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');

// Use the routes
app.use('/api', loginRoute);
app.use('/register', registerRoute); 
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
