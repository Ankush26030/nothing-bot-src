const { DataTypes } = require('sequelize');
const { noprefixSequelize } = require('../database');

const NoPrefixes = noprefixSequelize.define('NoPrefixes', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  });
  
  // Synchronize the model with the database
  NoPrefixes.sync();
  

module.exports = NoPrefixes;
