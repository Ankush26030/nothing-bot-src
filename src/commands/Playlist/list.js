const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-list',
  aliases: ['pllist', 'list'],
  category: 'Playlist',
  description: 'List all playlists or songs in a playlist',
  args: false,
  usage: '[playlist name]',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client, prefix) => {
    try {
      if (!args[0]) {
        // List all playlists
        const playlists = db.prepare('SELECT * FROM playlists WHERE UserId = ? ORDER BY PlaylistName ASC')
          .all(message.author.id);

        if (playlists.length === 0) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                  name: message.author.username || "Unknown User",
                  iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`<:x_cross:1250674944057278535> You don't have any playlists yet!`)
                .setTimestamp(),
            ],
          });
        }

        const playlistList = playlists.map((playlist, index) => {
          const songCount = db.prepare('SELECT COUNT(*) as count FROM playlist_songs WHERE PlaylistId = ?')
            .get(playlist.id).count;
          return `**${index + 1}.** ${playlist.PlaylistName} - ${songCount} song(s)`;
        }).join('\n');

        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setAuthor({
            name: `${message.author.username}'s Playlists` || "Unknown User",
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(playlistList)
          .setTimestamp()
          .setFooter({ text: `Total Playlists: ${playlists.length}` });

        return message.reply({ embeds: [embed] });
      } else {
        // List songs in a specific playlist
        const playlistName = args[0];
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

        const songList = songs.map((song, index) => {
          // Format duration
          const minutes = Math.floor(song.TrackDuration / 60000);
          const seconds = Math.floor((song.TrackDuration % 60000) / 1000);
          const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          return `**${index + 1}.** [${song.TrackTitle}](${song.TrackURL}) - ${duration}`;
        }).join('\n');

        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setAuthor({
            name: `${playlistName} Playlist` || "Unknown Playlist",
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(songList)
          .setTimestamp()
          .setFooter({ text: `Total Songs: ${songs.length}` });

        return message.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Error listing playlist:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while listing your playlists!`)
            .setTimestamp(),
        ],
      });
    }
  },
};