const { DataTypes } = require('sequelize');
const { prefixSequelize } = require('../database');

const Prefix = prefixSequelize.define('Prefix', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    prefix: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    oldPrefix: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
}, {
    tableName: 'prefixes',
    timestamps: false,
});


module.exports = Prefix;
