const db = require('../db/database');

class BlacklistedServerService {
  /**
   * Check if a server is blacklisted
   * @param {string} serverId - The Discord server ID
   * @returns {Promise<boolean>} - True if server is blacklisted
   */
  async isBlacklisted(serverId) {
    try {
      const row = await db.getAsync('SELECT * FROM blacklisted_servers WHERE server_id = ?', [serverId]);
      return !!row;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  }

  /**
   * Add a server to the blacklist
   * @param {string} serverId - The Discord server ID
   * @param {string} blacklistedBy - The user ID who blacklisted the server
   * @returns {Promise<boolean>} - True if successful
   */
  async addToBlacklist(serverId, blacklistedBy) {
    try {
      await db.runAsync(
        'INSERT OR IGNORE INTO blacklisted_servers (server_id, blacklisted_by) VALUES (?, ?)',
        [serverId, blacklistedBy]
      );
      return true;
    } catch (error) {
      console.error('Error adding server to blacklist:', error);
      return false;
    }
  }

  /**
   * Remove a server from the blacklist
   * @param {string} serverId - The Discord server ID
   * @returns {Promise<boolean>} - True if successful
   */
  async removeFromBlacklist(serverId) {
    try {
      await db.runAsync('DELETE FROM blacklisted_servers WHERE server_id = ?', [serverId]);
      return true;
    } catch (error) {
      console.error('Error removing server from blacklist:', error);
      return false;
    }
  }

  /**
   * Get all blacklisted servers
   * @returns {Promise<Array>} - Array of blacklisted servers
   */
  async getAllBlacklistedServers() {
    try {
      return await db.allAsync('SELECT * FROM blacklisted_servers');
    } catch (error) {
      console.error('Error getting blacklisted servers:', error);
      return [];
    }
  }
}

module.exports = new BlacklistedServerService();