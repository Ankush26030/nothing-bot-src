const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');

// Ensure the data directory exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create promisified versions of database methods
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.runAsync = promisify(db.run.bind(db));

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS blacklisted_servers (
      server_id TEXT PRIMARY KEY,
      blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      blacklisted_by TEXT NOT NULL
    )
  `);
  
  console.log('Database initialized with required tables');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = db;