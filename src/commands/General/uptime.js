const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'uptime',
  category: 'General',
  description: 'Displays the bot\'s uptime.',
  args: false,
  cooldown: 5,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    // Get the bot's uptime in milliseconds
    const uptime = client.uptime;

    // Convert milliseconds to a more readable format (days, hours, minutes, seconds)
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    // Create a formatted string for the uptime
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Create and send the embed message
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Bot Uptime')
      .setDescription(`The bot has been running for **${uptimeString}**.`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
