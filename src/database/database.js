const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create and initialize database connection
const db = new sqlite3.Database(path.join(dbDir, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Close database on application exit
process.on('SIGINT', () => {
    db.close();
});
process.on('SIGTERM', () => {
    db.close();
});

module.exports = db;