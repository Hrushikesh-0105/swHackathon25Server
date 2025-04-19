const db = require('../config/db');

const registerController = (req, res) => {
  const { studentId, sem, department, selectedCourses } = req.body;

  if (!studentId || !sem || !department || !Array.isArray(selectedCourses)) {
    return res.status(400).json({ error: 'Missing or invalid input' });
  }

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Transaction error' });

    const registerCourse = (courseId, callback) => {
      const checkSeatsQuery = `SELECT availableSeats FROM Courses WHERE courseId = ? AND dept = ? AND sem = ?`;
      db.query(checkSeatsQuery, [courseId, department, sem], (err, results) => {
        if (err || results.length === 0 || results[0].availableSeats <= 0) {
          return callback(`Course ${courseId} not available or full`);
        }

        const insertReg = `INSERT INTO Registrations (studentId, courseId) VALUES (?, ?)`;
        db.query(insertReg, [studentId, courseId], (err) => {
          if (err) return callback(`Registration failed for ${courseId}`);

          const updateSeats = `UPDATE Courses SET availableSeats = availableSeats - 1 WHERE courseId = ?`;
          db.query(updateSeats, [courseId], (err) => {
            if (err) return callback(`Failed to update seats for ${courseId}`);

            const updateStudent = `UPDATE Student SET coursesRegistered = coursesRegistered + 1 WHERE studentId = ?`;
            db.query(updateStudent, [studentId], (err) => {
              if (err) return callback(`Failed to update student record`);
              callback(null);
            });
          });
        });
      });
    };

    let completed = 0;
    let errors = [];

    selectedCourses.forEach(courseId => {
      registerCourse(courseId, err => {
        if (err) errors.push(err);
        completed++;

        if (completed === selectedCourses.length) {
          if (errors.length > 0) {
            db.rollback(() => res.status(400).json({ message: 'Some courses failed', errors }));
          } else {
            db.commit(err => {
              if (err) {
                return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
              }
              res.status(200).json({ message: 'Courses registered successfully!' });
            });
          }
        }
      });
    });
  });
};

module.exports = registerController;
