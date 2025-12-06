const Prefix = require('./models/prefix');
// Load prefix data into client.prefixes Map
async function loadPrefixes(client) {
  const prefixes = await Prefix.findAll();
  client.prefixes = new Map();
  prefixes.forEach(prefixRecord => {
      client.prefixes.set(prefixRecord.id, prefixRecord.prefix);
  });
}
const { initializeDatabase } = require('./database');
const MusicBot = require("./structures/MusicClient");
const client = new MusicBot();

module.exports = client;

async function initializeBot() {
  await initializeDatabase(); // Ensure database is initialized and tables are synced
  await loadPrefixes(client);
  client._loadPlayer();
  client._loadClientEvents();
  client._loadNodeEvents();
  client._loadPlayerEvents();
  client._loadCommands();
  client._loadSlashCommands();
  client.connect();
}

initializeBot();

process.on('unhandledRejection', (reason, p) => { console.log(reason, p); });

process.on('uncaughtException', (err, origin) => { console.log(err, origin); });
