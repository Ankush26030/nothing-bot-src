const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-remove',
  aliases: ['plrm', 'remove'],
  category: 'Playlist',
  description: 'Remove a song from a playlist',
  args: true,
  usage: '<playlist name> <song index or URL>',
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

    if (!args[1]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> Please specify a song index or URL to remove!`)
            .setTimestamp(),
        ],
      });
    }

    const playlistName = args[0];
    const songIdentifier = args[1];

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
      const playlistSongs = db.prepare('SELECT * FROM playlist_songs WHERE PlaylistId = ?')
        .all(playlist.id);

      if (playlistSongs.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> Your playlist **${playlistName}** is empty!`)
              .setTimestamp(),
          ],
        });
      }

      let songToRemove;
      let songIndex;

      // Check if the identifier is a number (index)
      if (!isNaN(songIdentifier)) {
        songIndex = parseInt(songIdentifier);
        
        // Check if the index is valid
        if (songIndex < 1 || songIndex > playlistSongs.length) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                  name: message.author.username || "Unknown User",
                  iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`<:x_cross:1250674944057278535> Invalid song index! Please provide a number between 1 and ${playlistSongs.length}.`)
                .setTimestamp(),
            ],
          });
        }
        
        // Get the song at the specified index (array is 0-indexed)
        songToRemove = playlistSongs[songIndex - 1];
      } else {
        // If it's a URL, find the song with that URL
        songToRemove = playlistSongs.find(song => song.TrackURL === songIdentifier);
        
        if (!songToRemove) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                  name: message.author.username || "Unknown User",
                  iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`<:x_cross:1250674944057278535> Could not find a song with that URL in your playlist!`)
                .setTimestamp(),
            ],
          });
        }
        
        // Find the index of the song (for display purposes)
        songIndex = playlistSongs.findIndex(song => song.id === songToRemove.id) + 1;
      }

      // Remove the song from the playlist
      db.prepare('DELETE FROM playlist_songs WHERE id = ?')
        .run(songToRemove.id);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_tick:1250674883080224768> Successfully removed [${songToRemove.TrackTitle}](${songToRemove.TrackURL}) from your playlist **${playlistName}**!`)
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while removing the track from your playlist!`)
            .setTimestamp(),
        ],
      });
    }
  },
};