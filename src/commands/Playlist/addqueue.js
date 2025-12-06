const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-addqueue',
  aliases: ['pladdq', 'plq', 'addqueue'],
  category: 'Playlist',
  description: 'Add the entire queue to a playlist',
  args: true,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
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

      // Get the player and check if there's a queue
      const player = client.manager.players.get(message.guild.id);
      if (!player || player.queue.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> There are no tracks in the queue!`)
              .setTimestamp(),
          ],
        });
      }

      // Add current track and the entire queue to the playlist
      const allTracks = player.queue.current ? [player.queue.current, ...player.queue] : [...player.queue];
      let addedCount = 0;
      let duplicateCount = 0;

      const insertTrack = db.prepare('INSERT INTO playlist_songs (PlaylistId, TrackURL, TrackTitle, TrackDuration, AddedBy) VALUES (?, ?, ?, ?, ?)');
      
      for (const track of allTracks) {
        // Check if the track is already in the playlist
        const existingTrack = db.prepare('SELECT * FROM playlist_songs WHERE PlaylistId = ? AND TrackURL = ?')
          .get(playlist.id, track.uri);

        if (!existingTrack) {
          insertTrack.run(playlist.id, track.uri, track.title, track.duration, message.author.id);
          addedCount++;
        } else {
          duplicateCount++;
        }
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_tick:1250674883080224768> Successfully added **${addedCount}** tracks to your playlist **${playlistName}**!${duplicateCount > 0 ? `\n**${duplicateCount}** duplicate tracks were skipped.` : ''}`)
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error('Error adding queue to playlist:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while adding the queue to your playlist!`)
            .setTimestamp(),
        ],
      });
    }
  },
};