const db = require('../database/database2');

class User {
  constructor(data = {}) {
    this._id = data.id || data._id;
    this.bio = data.bio || '';
    this.songsPlayed = data.songs_played || data.songsPlayed || 0;
    this.commandsUsed = data.commands_used || data.commandsUsed || 0;
    this.blacklisted = data.blacklisted === 1 || data.blacklisted === true ? true : false;
    this.developer = data.developer === 1 || data.developer === true ? true : false;
    this.songHistory = data.songHistory || [];
  }

  /**
   * Find a user by ID
   * @param {string} userId - Discord user ID
   * @param {function} callback - Callback function(err, user)
   */
  static findById(userId, callback) {
    // Check if user exists
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        callback(err, null);
        return;
      }

      if (!row) {
        // Create a new user if it doesn't exist
        const newUser = new User({ _id: userId });
        
        // Insert the new user into the database
        db.run(
          'INSERT INTO users (id, bio, songs_played, commands_used, blacklisted, developer) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, '', 0, 0, 0, 0],
          (err) => {
            if (err) {
              callback(err, null);
              return;
            }
            callback(null, newUser);
          }
        );
        return;
      }

      // User found, create User instance
      const user = new User({
        _id: row.id,
        bio: row.bio,
        songs_played: row.songs_played,
        commands_used: row.commands_used,
        blacklisted: row.blacklisted === 1,
        developer: row.developer === 1
      });

      // Get user's song history
      db.all(`
        SELECT t.* FROM tracks t
        JOIN song_history sh ON t.id = sh.track_id
        WHERE sh.user_id = ?
        ORDER BY sh.played_at DESC
      `, [userId], (err, tracks) => {
        if (err) {
          console.error('Error fetching song history:', err);
          callback(null, user);
          return;
        }

        // Convert tracks to the expected format
        user.songHistory = tracks.map(t => ({
          _id: t.id,
          title: t.title,
          url: t.url,
          author: t.author,
          duration: t.duration,
          thumbnail: t.thumbnail,
          platform: t.platform,
          playable: t.playable === 1
        }));

        callback(null, user);
      });
    });
  }

  /**
   * Save the user
   * @returns {Promise} Promise that resolves when user is saved
   */
  save() {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO users (id, bio, songs_played, commands_used, blacklisted, developer) VALUES (?, ?, ?, ?, ?, ?)',
        [
          this._id,
          this.bio,
          this.songsPlayed,
          this.commandsUsed,
          this.blacklisted ? 1 : 0,
          this.developer ? 1 : 0
        ],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this);
        }
      );
    });
  }

  /**
   * Update user properties
   * @param {Object} updateData - Object with properties to update
   * @returns {Promise} Promise that resolves when update completes
   */
  updateOne(updateData) {
    return new Promise((resolve, reject) => {
      // For bio updates specifically
      if (updateData.bio !== undefined) {
        this.bio = updateData.bio;
        
        db.run('UPDATE users SET bio = ? WHERE id = ?', [updateData.bio, this._id], function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ modifiedCount: this.changes });
        });
        return;
      }
      
      // For other updates, build dynamic query
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        // Convert camelCase to snake_case for database fields
        let dbField = key;
        let dbValue = value;
        
        if (key === 'songsPlayed') {
          dbField = 'songs_played';
          this.songsPlayed = value;
        } else if (key === 'commandsUsed') {
          dbField = 'commands_used';
          this.commandsUsed = value;
        } else if (key === 'blacklisted') {
          this.blacklisted = value;
          dbValue = value ? 1 : 0;
        } else if (key === 'developer') {
          this.developer = value;
          dbValue = value ? 1 : 0;
        } else {
          this[key] = value;
        }
        
        fields.push(`${dbField} = ?`);
        values.push(dbValue);
      }
      
      // If nothing to update
      if (fields.length === 0) {
        resolve({ modifiedCount: 0 });
        return;
      }
      
      values.push(this._id);
      
      db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ modifiedCount: this.changes });
      });
    });
  }
  
  /**
   * Add a track to user's history
   * @param {Object} track - Track object to add to history
   * @returns {Promise} Promise that resolves when track is added
   */
  addToHistory(track) {
    return new Promise((resolve, reject) => {
      // Start transaction
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // First insert/update the track
        db.run(`
          INSERT OR REPLACE INTO tracks (id, title, url, author, duration, thumbnail, platform, playable)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          track._id,
          track.title || '',
          track.url || '',
          track.author || '',
          track.duration || 0,
          track.thumbnail || '',
          track.platform || '',
          track.playable ? 1 : 0
        ], (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          // Then add to history
          db.run(`
            INSERT INTO song_history (user_id, track_id)
            VALUES (?, ?)
          `, [this._id, track._id], (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            // Update songs played count
            db.run(`
              UPDATE users SET songs_played = songs_played + 1
              WHERE id = ?
            `, [this._id], (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              // Update the local object
              this.songsPlayed++;
              
              // Add to local song history
              this.songHistory.unshift(track);
              
              // Commit transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                resolve(true);
              });
            });
          });
        });
      });
    });
  }
}

module.exports = User;