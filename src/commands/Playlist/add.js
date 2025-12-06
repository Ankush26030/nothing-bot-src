const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-add',
  aliases: ['pladd', 'add'],
  category: 'Playlist',
  description: 'Add a song to a playlist',
  args: true,
  usage: '<playlist name> <song url>',
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

    if (!args[1]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> Please specify a song URL!`)
            .setTimestamp(),
        ],
      });
    }

    const playlistName = args[0];
    const trackURL = args[1];

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

      // Resolve the track using the URL
      const player = client.manager.players.get(message.guild.id);
      let res;

      try {
        res = await player.search(trackURL, message.author);
        if (res.loadType === 'LOAD_FAILED') {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                  name: message.author.username || "Unknown User",
                  iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`<:x_cross:1250674944057278535> Failed to load the track!`)
                .setTimestamp(),
            ],
          });
        }
      } catch (err) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> Failed to load the track!`)
              .setTimestamp(),
          ],
        });
      }

      // Get the track details
      const tracks = res.tracks;
      if (!tracks.length) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> No tracks found for the URL!`)
              .setTimestamp(),
          ],
        });
      }

      const track = tracks[0];

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
      console.error('Error adding track to playlist:', error);
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