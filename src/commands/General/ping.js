const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: 'ping',
  category: 'General',
  aliases: ['latency'],
  cooldown: 5,
  description: 'Displays the bot latency and API response time',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    // Calculate API ping
    const apiPing = client.ws.ping;
    
    // Calculate message latency
    const sent = await message.reply({ content: 'Calculating Ping...' });
    const messageLatency = sent.createdTimestamp - message.createdTimestamp;
    
    // Create embed
    const pingEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `${messageLatency}ms`, inline: true },
        { name: 'API Latency', value: `${apiPing}ms`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    // Edit the initial message with the embed
    await sent.edit({ content: null, embeds: [pingEmbed] });
  }
}