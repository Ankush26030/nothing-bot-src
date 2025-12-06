const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'volume',
  aliases: ['vol'],
  category: 'Music',
  description: 'Adjust the player volume (0-150%)',
  args: false,
  usage: '[volume]',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    try {
      // Get the player instance for this guild
      const player = client.manager.players.get(message.guild.id);
      
      // Check if player exists
      if (!player) {
        const noPlayerEmbed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
          })
          .setDescription('There is no active player in this server. Please use the join command first.')
          .setTimestamp();
          
        return message.channel.send({ embeds: [noPlayerEmbed] });
      }

      // If no volume argument is provided, display current volume
      if (!args[0]) {
        return message.channel.send({
          content: `Current volume: **${player.volume}%** 🔊`
        });
      }

      // Parse the volume argument
      const volume = parseInt(args[0]);
      
      // Validate volume range
      if (isNaN(volume) || volume < 0 || volume > 150) {
        const invalidVolumeEmbed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setDescription('❌ Please provide a valid volume between **0** and **150%**.')
          .setTimestamp();
          
        return message.channel.send({ embeds: [invalidVolumeEmbed] });
      }

      // Check if the new volume is the same as current volume
      if (player.volume === volume) {
        const sameVolumeEmbed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setDescription(`Volume is already set to **${volume}%** 🔊`)
          .setTimestamp();
          
        return message.channel.send({ embeds: [sameVolumeEmbed] });
      }

      // Set the new volume
      await player.setVolume(volume);
      
      // Create emoji based on volume level
      let volumeEmoji = '🔇';
      if (volume > 70) volumeEmoji = '🔊';
      else if (volume > 30) volumeEmoji = '🔉';
      else if (volume > 0) volumeEmoji = '🔈';
      
      // Send success message
      const volumeChangedEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription(`${volumeEmoji} Volume set to **${volume}%**`)
        .setFooter({ 
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();
        
      return message.channel.send({ embeds: [volumeChangedEmbed] });
      
    } catch (error) {
      console.error(`Volume command error: ${error.message}`);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`❌ Error: ${error.message}`)
        .setTimestamp();
        
      return message.channel.send({ embeds: [errorEmbed] });
    }
  }
};