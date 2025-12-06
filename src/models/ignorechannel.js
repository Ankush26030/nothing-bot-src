const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ignorechannel', {
    guildId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true
  });
};