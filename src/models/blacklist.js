const { DataTypes } = require('sequelize');
const { blacklistSequelize } = require('../database');

const Blacklist = blacklistSequelize.define('Blacklist', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  });
  
  // Synchronize the model with the database
  Blacklist.sync();
  

module.exports = Blacklist;