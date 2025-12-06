const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const VoteBypass = sequelize.define('VoteBypass', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Discord user ID'
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: true, // null means global bypass
            comment: 'Discord guild ID (null for global bypass)'
        },
        addedBy: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Discord user ID who added the bypass'
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Reason for the bypass'
        },
        permanent: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Whether the bypass is permanent'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When the bypass expires (null if permanent)'
        }
    }, {
        tableName: 'vote_bypasses',
        timestamps: true,
        indexes: [
            {
                // Create unique index for userId + guildId combination
                unique: true,
                fields: ['userId', 'guildId'],
                name: 'unique_user_guild_bypass'
            },
            {
                fields: ['userId']
            },
            {
                fields: ['guildId']
            }
        ]
    });

    return VoteBypass;
};