const { EmbedBuilder } = require('discord.js');

// Helper function to format duration with error handling
const formatDuration = (duration) => {
  if (!duration || isNaN(duration)) return 'Unknown';
  
  try {
    // Convert to milliseconds if in seconds
    const durationMs = duration > 1000 ? duration : duration * 1000;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  } catch (error) {
    console.error('Duration formatting error:', error);
    return 'Unknown';
  }
};

module.exports = {
  name: 'nowplaying',
  category: 'Music',
  description: 'Shows the currently playing song in the queue.',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    // Fetch the music player for the guild
    const player = client.manager.players.get(message.guild.id);
    if (!player || !player.queue.current) {
      // If no song is playing, notify the user
      const noSongEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🎶 Now Playing')
        .setDescription('There is no song currently playing!')
        .setFooter({
          text: `Requested by ${message.author.username}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });
      return message.reply({ embeds: [noSongEmbed] });
    }

    // Get the current track details
    const track = player.queue.current;
    
    // Check for a thumbnail
    const thumbnail =
      track.thumbnail ||
      `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`; // Fallback for YouTube videos

    // Get duration with fallback options
    const trackDuration = track.duration || track.length || player.queue.current.duration;
    const duration = formatDuration(trackDuration);
    
    // Add debug logging
    console.log('Track duration:', trackDuration);
    console.log('Formatted duration:', duration);
    
    // Build the embed for the now playing song
    const nowPlayingEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('<a:Playing:1295493488548253786> Now Playing')
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: 'Artist', value: track.author || 'Unknown', inline: true },
        { name: 'Requested By', value: track.requester ? track.requester.username : 'Unknown', inline: true },
        { name: 'Duration', value: duration, inline: true }
      )
      .setThumbnail(thumbnail)
      .setFooter({
        text: `Enjoy your music!`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    // Reply with the embed
    return message.reply({ embeds: [nowPlayingEmbed] });
  },
};