const { DataTypes } = require('sequelize');
const { playlistSequelize } = require('../database');

const Playlist = playlistSequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    playlistName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    playlist: {
        type: DataTypes.JSONB, // Store playlist as JSONB type for storing array of songs
        allowNull: true,
    },
}, {
    tableName: 'playlists',
    timestamps: false,
});

playlistSequelize.sync();

module.exports = Playlist;
