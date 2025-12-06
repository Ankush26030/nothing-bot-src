const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-addnowplaying',
  aliases: ['pladdnp', 'plnp', 'addnowplaying'],
  category: 'Playlist',
  description: 'Add the currently playing song to a playlist',
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

      // Get the currently playing track
      const player = client.manager.players.get(message.guild.id);
      if (!player || !player.queue.current) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> There is no track currently playing!`)
              .setTimestamp(),
          ],
        });
      }

      const track = player.queue.current;

      // Check if the track is already in the playlist
      const existingTrack = db.prepare('SELECT * FROM playlist_songs WHERE PlaylistId = ? AND TrackURL = ?')
        .get(playlist.id, track.uri);

      if (existingTrack) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> This track is already in your playlist!`)
              .setTimestamp(),
          ],
        });
      }

      // Add the track to the playlist
      db.prepare('INSERT INTO playlist_songs (PlaylistId, TrackURL, TrackTitle, TrackDuration, AddedBy) VALUES (?, ?, ?, ?, ?)')
        .run(playlist.id, track.uri, track.title, track.duration, message.author.id);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_tick:1250674883080224768> Successfully added [${track.title}](${track.uri}) to your playlist **${playlistName}**!`)
            .setTimestamp(),
        ],
      });
    } catch (error) {
      console.error('Error adding now playing track to playlist:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while adding the track to your playlist!`)
            .setTimestamp(),
        ],
      });
    }
  },
};