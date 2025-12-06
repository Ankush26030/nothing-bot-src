const { DataTypes } = require('sequelize');
const { teamSequelize } = require('../database');

const TeamManagement = teamSequelize.define('TeamManagement', {
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    addedBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
  
  // Synchronize the model with the database
  TeamManagement.sync();
  

module.exports = TeamManagement;