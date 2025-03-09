const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('guild_database.db');

db.serialize(() => {
    // Users table with roles
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // Guilds table
    db.run(`CREATE TABLE IF NOT EXISTS guilds (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        description TEXT,
        leader_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leader_id) REFERENCES users(id)
    )`);

    // Guild members table
    db.run(`CREATE TABLE IF NOT EXISTS guild_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(guild_id, user_id)
    )`);
    
    // Parent-child relationships table
    db.run(`CREATE TABLE IF NOT EXISTS parent_child (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER NOT NULL,
        child_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(parent_id, child_id)
    )`);
});

module.exports = db; 