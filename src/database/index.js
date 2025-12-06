const { Sequelize } = require('sequelize');
const path = require('path');

// Set up Sequelize to use SQLite
const prefixSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'prefix.sqlite'),
    logging: false
});

const autoreconnectSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'autoreconnect.sqlite'),
    logging: false
});

const noprefixSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'noprefix.sqlite'),
    logging: false
});

const playlistSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'playlists.sqlite'),
    logging: false
});

const blacklistSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'blacklist.sqlite'),
    logging: false
});

const maintenanceSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'maintenance.sqlite'),
    logging: false
});

const afkSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'afk.sqlite'),
    logging: false
});

const ignorechannelSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'ignorechannel.sqlite'),
    logging: false
});

const teamSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'team.sqlite'),
    logging: false
});

// Vote bypass database
const votebypassSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'votebypass.sqlite'),
    logging: false
});

// Import and initialize models
const IgnoreChannelModel = require('../models/ignorechannel');
const VoteBypassModel = require('../models/votebypass');

const IgnoreChannel = IgnoreChannelModel(ignorechannelSequelize);
const VoteBypass = VoteBypassModel(votebypassSequelize);

// Function to initialize the databases
async function initializeDatabase() {
    await prefixSequelize.sync({ alter: true });
    await autoreconnectSequelize.sync({ alter: true });
    await noprefixSequelize.sync({ alter: true });
    await playlistSequelize.sync({ alter: true });
    await blacklistSequelize.sync({ alter: true });
    await maintenanceSequelize.sync({ alter: true });
    await afkSequelize.sync({ alter: true });
    await ignorechannelSequelize.sync({ alter: true });
    await teamSequelize.sync({ alter: true });
    await votebypassSequelize.sync({ alter: true });
    console.log('Database synchronized');
}

module.exports = {
    prefixSequelize,
    autoreconnectSequelize,
    noprefixSequelize,
    playlistSequelize,
    blacklistSequelize,
    maintenanceSequelize,
    afkSequelize,
    ignorechannelSequelize,
    teamSequelize,
    votebypassSequelize,
    IgnoreChannel,
    VoteBypass,
    initializeDatabase
};