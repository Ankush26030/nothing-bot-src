const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-dupes',
  aliases: ['pldupes', 'dupes'],
  category: 'Playlist',
  description: 'Find and remove duplicate tracks in a playlist',
  args: true,
  usage: '<playlist name> [remove]',
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
    const shouldRemove = args[1]?.toLowerCase() === 'remove';

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

      if (songs.length === 0) {
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

      // Find duplicates
      const trackUrls = new Map();
      const duplicates = [];

      for (const song of songs) {
        if (trackUrls.has(song.TrackURL)) {
          duplicates.push({
            original: trackUrls.get(song.TrackURL),
            duplicate: song
          });
        } else {
          trackUrls.set(song.TrackURL, song);
        }
      }

      if (duplicates.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_tick:1250674883080224768> No duplicate tracks found in your playlist **${playlistName}**!`)
              .setTimestamp(),
          ],
        });
      }

      if (shouldRemove) {
        // Remove duplicates
        const deleteStmt = db.prepare('DELETE FROM playlist_songs WHERE id = ?');
        
        for (const dupe of duplicates) {
          deleteStmt.run(dupe.duplicate.id);
        }

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_tick:1250674883080224768> Successfully removed **${duplicates.length}** duplicate tracks from your playlist **${playlistName}**!`)
              .setTimestamp(),
          ],
        });
      } else {
        // Show duplicates
        const duplicateList = duplicates.map((dupe, index) => {
          return `**${index + 1}.** [${dupe.duplicate.TrackTitle}](${dupe.duplicate.TrackURL})`;
        }).join('\n').substring(0, 4000); // Discord embed description has a 4096 character limit

        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setAuthor({
            name: message.author.username || "Unknown User",
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`Found ${duplicates.length} Duplicate Tracks`)
          .setDescription(`The following tracks are duplicates in your playlist **${playlistName}**:\n\n${duplicateList}\n\nUse \`${prefix}playlist-dupes ${playlistName} remove\` to remove all duplicates.`)
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while checking for duplicates!`)
            .setTimestamp(),
        ],
      });
    }
  },
};