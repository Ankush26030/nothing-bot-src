const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'clearfilters',
  category: 'Filters',
  aliases: ['clear', 'clearfilter'],
  cooldown: 5,
  description: 'Reset all active audio filters',
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

    // Check if there's a current song playing
    if (!player.queue || !player.queue.current) {
      const noSongEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription('❌ | No song is currently playing.')
        .setTimestamp();
      return message.reply({ embeds: [noSongEmbed] });
    }

    try {
      // Clear all filters
      player.clearfilter();
      const statusEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription('🔄 | All audio filters have been reset')
        .addFields(
          { 
            name: 'Now Playing', 
            value: player.queue.current.title || 'Unknown',
            inline: true 
          },
          { 
            name: 'Filter Status', 
            value: '⚪ All Disabled',
            inline: true 
          }
        )
        .setFooter({ 
          text: 'Audio has been restored to original quality',
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();
      return message.reply({ embeds: [statusEmbed] });
    } catch (error) {
      console.error('Clear filters error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('❌ | An error occurred while clearing the audio filters.')
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }
  }
};