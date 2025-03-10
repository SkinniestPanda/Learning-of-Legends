// routes/attempts.js
const express = require('express');
const router = express.Router();
const { run, all } = require('../db/student_database');

// POST endpoint to add a new attempt
router.post('/', async (req, res) => {
  try {
    const { studentId, question, correctAnswer, studentAnswer, isCorrect, operation, timestamp } = req.body;
    const result = await run(
      `INSERT INTO attempts (studentId, question, correctAnswer, studentAnswer, isCorrect, operation, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, question, correctAnswer, studentAnswer, isCorrect ? 1 : 0, operation, timestamp]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET endpoint to retrieve all attempts
router.get('/', async (req, res) => {
  try {
    const rows = await all(`SELECT * FROM attempts`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
