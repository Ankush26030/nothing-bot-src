const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'bass',
  category: 'Filters',
  cooldown: 5,
  description: 'Toggle bass boost effect for the current track',
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
      // Toggle bass effect
      const isBassEnabled = player.bass;
      player.setBass(!isBassEnabled);

      const statusEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`🔊 | Bass boost has been ${!isBassEnabled ? 'enabled' : 'disabled'}`)
        .addFields(
          { 
            name: 'Now Playing', 
            value: `${player.queue.current.title || 'Unknown'}`,
            inline: true 
          },
          { 
            name: 'Bass Status', 
            value: `${!isBassEnabled ? '🟢 Enhanced' : '⚪ Normal'}`,
            inline: true 
          }
        )
        .setFooter({ 
          text: `Use ${prefix}bass to toggle the effect`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.reply({ embeds: [statusEmbed] });

    } catch (error) {
      console.error('Bass filter error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setDescription('❌ | An error occurred while toggling the bass boost.')
        .setTimestamp();

      return message.reply({ embeds: [errorEmbed] });
    }
  }
};