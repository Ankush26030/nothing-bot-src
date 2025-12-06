const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');
const path = require('path');

// Create a new Sequelize instance for AFK data
const afkSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'afk.sqlite'),
    logging: false
});

// Define the AFK model
const AFK = afkSequelize.define('AFK', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'AFK'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    mentionCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

// Synchronize the model with the database
AFK.sync();

module.exports = AFK;