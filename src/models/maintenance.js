const { DataTypes } = require('sequelize');
const { maintenanceSequelize } = require('../database'); // Reusing blacklistSequelize for simplicity

const Maintenance = maintenanceSequelize.define('Maintenance', {
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    updatedBy: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Synchronize the model with the database
Maintenance.sync();

module.exports = Maintenance;