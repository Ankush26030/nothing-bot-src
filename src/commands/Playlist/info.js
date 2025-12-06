const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-info',
  aliases: ['plinfo', 'info'],
  category: 'Playlist',
  description: 'Get information about a playlist',
  args: true,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client, prefix) => {
    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> Please specify a playlist name!`)
            .setTimestamp(),
        ],
      });
    }

    const playlistName = args[0];

    try {
      // Check if playlist exists
      const playlist = db.prepare('SELECT * FROM playlists WHERE UserId = ? AND PlaylistName = ?')
        .get(message.author.id, playlistName);

      if (!playlist) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`)
              .setTimestamp(),
          ],
        });
      }

      // Get all songs in the playlist
      const songs = db.prepare('SELECT * FROM playlist_songs WHERE PlaylistId = ? ORDER BY id ASC')
        .all(playlist.id);

      // Format creation date
      const creationDate = new Date(playlist.CreatedOn * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`${playlistName} Playlist Info`)
        .setDescription(`
          **Songs:** ${songs.length}
          **Created On:** ${creationDate}
        `)
        .setTimestamp();

      if (songs.length > 0) {
        // Add some sample songs (first 5)
        const sampleSongs = songs.slice(0, 5).map((song, index) => {
          return `**${index + 1}.** [${song.TrackTitle}](${song.TrackURL})`;
        }).join('\n');

        embed.addFields({ name: 'Sample Songs', value: sampleSongs });
        
        if (songs.length > 5) {
          embed.setFooter({ text: `And ${songs.length - 5} more songs. Use "${prefix}playlist-list ${playlistName}" to see all songs.` });
        }
      }

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error getting playlist info:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while getting playlist info!`)
            .setTimestamp()
        ]
      });
    }
  },
};