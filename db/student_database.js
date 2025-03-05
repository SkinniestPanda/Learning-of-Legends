// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Hard-coded database file path; adjust as needed.
const dbPath = path.join(__dirname, 'student_database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Promisify db.run
function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Promisify db.all
function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize the database by creating the attempts table and indexes
async function initializeDatabase() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId TEXT,
        question TEXT,
        correctAnswer INTEGER,
        studentAnswer INTEGER,
        isCorrect INTEGER,
        operation TEXT,
        timestamp INTEGER
      )
    `);
    // Create indexes to optimize queries
    await run(`CREATE INDEX IF NOT EXISTS idx_studentId ON attempts(studentId)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_operation ON attempts(operation)`);
  } catch (err) {
    console.error("Error initializing database:", err.message);
  }
}

initializeDatabase();

module.exports = { db, run, all };
