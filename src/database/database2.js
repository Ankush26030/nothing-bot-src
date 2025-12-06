const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Initialize database
const db = new sqlite3.Database(path.join(dbDir, 'bot_database.sqlite'));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    bio TEXT DEFAULT '',
    songs_played INTEGER DEFAULT 0,
    commands_used INTEGER DEFAULT 0,
    blacklisted INTEGER DEFAULT 0,
    developer INTEGER DEFAULT 0
  )
`);

// Create tracks table
db.run(`
  CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    title TEXT,
    url TEXT,
    author TEXT,
    duration INTEGER,
    thumbnail TEXT,
    platform TEXT,
    playable INTEGER
  )
`);

// Create song_history table
db.run(`
  CREATE TABLE IF NOT EXISTS song_history (
    user_id TEXT,
    track_id TEXT,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, track_id, played_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
  )
`);

// Export the database instance
module.exports = db;