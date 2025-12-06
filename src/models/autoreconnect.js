const { DataTypes } = require('sequelize');
const { autoreconnectSequelize } = require('../database');

const AutoReconnect = autoreconnectSequelize.define('AutoReconnect', {
    Guild: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    TextId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    VoiceId: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
}, {
    tableName: 'AutoReconnect',
    timestamps: false,
});

AutoReconnect.sync();

module.exports = AutoReconnect;
