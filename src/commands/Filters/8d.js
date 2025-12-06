const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: '8d',
  category: 'Filters',
  cooldown: 5,
  description: 'Toggle 8D audio effect for the current track',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    // Check if a player exists
    if (!player) {
      const noPlayerEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription('❌ | No song is currently playing in this server.')
        .setTimestamp();

      return message.reply({ embeds: [noPlayerEmbed] });
    }

    try {
      // Toggle 8D effect
      const is8DEnabled = player._8d;
      player.set8D(!is8DEnabled);

      const statusEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`🎧 | 8D Audio has been ${!is8DEnabled ? 'enabled' : 'disabled'}`)
        .addFields(
          { 
            name: 'Current Track', 
            value: `${player.queue.current.title || 'Unknown'}`,
            inline: true 
          },
          { 
            name: 'Filter Status', 
            value: `${!is8DEnabled ? '🟢 Active' : '🔴 Inactive'}`,
            inline: true 
          }
        )
        .setFooter({ 
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return message.reply({ embeds: [statusEmbed] });

    } catch (error) {
      console.error('8D filter error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('❌ | An error occurred while toggling the 8D filter.')
        .setTimestamp();

      return message.reply({ embeds: [errorEmbed] });
    }
  }
};