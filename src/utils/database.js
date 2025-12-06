const sqlite3 = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dbDirectory = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

// Connect to the database
const db = new sqlite3(path.join(dbDirectory, 'playlists.sqlite'));

// Create tables if they don't exist
db.exec(`
CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    UserName TEXT NOT NULL,
    UserId TEXT NOT NULL,
    PlaylistName TEXT NOT NULL,
    CreatedOn INTEGER NOT NULL,
    UNIQUE(UserId, PlaylistName)
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    PlaylistId INTEGER NOT NULL,
    TrackURL TEXT NOT NULL,
    TrackTitle TEXT,
    TrackDuration INTEGER,
    AddedBy TEXT NOT NULL,
    FOREIGN KEY (PlaylistId) REFERENCES playlists(id) ON DELETE CASCADE
);
`);

module.exports = db;