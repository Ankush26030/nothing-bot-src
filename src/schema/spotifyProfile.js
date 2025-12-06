const db = require('../database/database');

// Initialize the database tables
function initTables() {
    return new Promise((resolve, reject) => {
        // Create spotify_profiles table
        db.run(`CREATE TABLE IF NOT EXISTS spotify_profiles (
            userId TEXT PRIMARY KEY,
            profileId TEXT NOT NULL,
            username TEXT NOT NULL,
            profileUrl TEXT NOT NULL,
            followers INTEGER NOT NULL,
            totalPlaylists INTEGER NOT NULL
        )`, (err) => {
            if (err) return reject(err);
            
            // Create spotify_playlists table for the array relationship
            db.run(`CREATE TABLE IF NOT EXISTS spotify_playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                playlistId TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES spotify_profiles (userId) ON DELETE CASCADE,
                UNIQUE(userId, playlistId)
            )`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}

// Initialize tables when module is loaded
initTables().catch(err => console.error('Failed to initialize tables:', err));

// SpotifyProfile class with methods that match MongoDB interface
class SpotifyProfile {
    static findOne(filter) {
        return new Promise((resolve, reject) => {
            const { userId } = filter;
            
            db.get(`SELECT * FROM spotify_profiles WHERE userId = ?`, [userId], (err, profile) => {
                if (err) return reject(err);
                if (!profile) return resolve(null);
                
                // Get associated playlist IDs
                db.all(`SELECT playlistId FROM spotify_playlists WHERE userId = ?`, [userId], (err, playlists) => {
                    if (err) return reject(err);
                    profile.playlistIds = playlists.map(p => p.playlistId);
                    resolve(profile);
                });
            });
        });
    }

    static findOneAndUpdate(filter, update, options) {
        return new Promise((resolve, reject) => {
            const { userId } = filter;
            const { profileId, username, profileUrl, followers, totalPlaylists } = update;
            
            // Check if profile exists
            this.findOne(filter).then(profile => {
                if (profile) {
                    // Update existing profile
                    db.run(`UPDATE spotify_profiles SET 
                        profileId = ?, 
                        username = ?, 
                        profileUrl = ?, 
                        followers = ?, 
                        totalPlaylists = ? 
                        WHERE userId = ?`, 
                        [profileId, username, profileUrl, followers, totalPlaylists, userId], 
                        (err) => {
                            if (err) return reject(err);
                            resolve({ userId, ...update });
                        }
                    );
                } else if (options && options.upsert) {
                    // Insert new profile
                    db.run(`INSERT INTO spotify_profiles 
                        (userId, profileId, username, profileUrl, followers, totalPlaylists) 
                        VALUES (?, ?, ?, ?, ?, ?)`, 
                        [userId, profileId, username, profileUrl, followers, totalPlaylists], 
                        (err) => {
                            if (err) return reject(err);
                            resolve({ userId, ...update });
                        }
                    );
                } else {
                    resolve(null);
                }
            }).catch(reject);
        });
    }

    static deleteOne(filter) {
        return new Promise((resolve, reject) => {
            const { userId } = filter;
            
            db.run(`DELETE FROM spotify_profiles WHERE userId = ?`, [userId], function(err) {
                if (err) return reject(err);
                resolve({ deleted: this.changes > 0 });
            });
        });
    }
}

module.exports = SpotifyProfile;