// controllers/loginController.js
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Import the database connection

exports.login = (req, res) => {
  const { id, password, role } = req.body;

  // Validate form input
  if (!id || !password || !role) {
    return res.status(400).send('Missing id, password, or role');
  }

  let query;
  if (role === 'student') {
    query = 'SELECT * FROM Students WHERE studentId = ?';
  } else if (role === 'admin') {
    query = 'SELECT * FROM Admin WHERE adminId = ?';
  } else {
    return res.status(400).send('Invalid role');
  }

  // Query the database
  db.execute(query, [id], (err, results) => {
    if (err) {
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(401).send('User not found');
    }

    const user = results[0];

    // Compare password using bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Error comparing password');
      }

      if (!isMatch) {
        return res.status(401).send('Invalid credentials');
      }

      // Send a success message
      res.send({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          role: role
        }
      });
    });
  });
};
