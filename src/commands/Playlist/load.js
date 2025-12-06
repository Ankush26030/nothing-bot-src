const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'pl-load',
  aliases: ['plload', 'load'],
  category: 'Playlist',
  description: 'Load a playlist',
  args: true,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const Name = args[0];

    if (!args[0]) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setDescription(`<:x_cross:1250674944057278535> Please specify a playlist name.`)
        ],
      });
    }

    try {
      // Get the playlist info
      const playlist = db.prepare("SELECT * FROM playlists WHERE UserId = ? AND PlaylistName = ?")
        .get(message.author.id, Name);

      if (!playlist) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription(`<:x_cross:1250674944057278535> You don't have a playlist with the name **${Name}**`),
          ],
        });
      }

      // Get the songs from the playlist
      const songs = db.prepare("SELECT * FROM playlist_songs WHERE PlaylistId = ?")
        .all(playlist.id);

      if (!songs || songs.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription(`<:x_cross:1250674944057278535> Your playlist **${Name}** doesn't have any songs.`),
          ],
        });
      }

      const player = await client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: message.member.voice.channel.id,
        textId: message.channel.id,
        deaf: true,
      });

      if (!player) return;

      let count = 0;
      const m = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(`<:x_tick:1250674883080224768> Loading tracks from your playlist **${Name}**...`)
        ],
      });

      for (const song of songs) {
        // Use TrackURL as the primary search parameter, fallback to title if URL is not available
        const searchQuery = song.TrackURL || song.TrackTitle;
        
        if (!searchQuery) continue;
        
        let s = await player.search(searchQuery, { requester: message.author });
        
        if (s.type === "TRACK") {
          if (player) player.queue.add(s.tracks[0]);
          if (player && !player.playing && !player.paused) await player.play();
          ++count;
        } else if (s.type === 'SEARCH') {
          await player.queue.add(s.tracks[0]);
          if (player && !player.playing && !player.paused) await player.play();
          ++count;
        } else if (s.type === 'PLAYLIST') {
          await player.queue.add(s.tracks[0]);
          if (player && !player.playing && !player.paused) await player.play();
          ++count;
        }
      }

      if (player && !player.queue.current) player.destroy();

      if (count <= 0 && m) {
        return await m.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setDescription(`<:x_cross:1250674944057278535> Couldn't add any tracks from your playlist **${Name}** to the queue.`)
          ],
        });
      }

      if (m) {
        return await m.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
              .setDescription(`<:x_tick:1250674883080224768> Added [**${count}**](https://discord.gg/w77ymEU82a) track(s) from your playlist **${Name}** to the queue.`)
          ],
        });
      }
    } catch (error) {
      console.error('Error in playlist-load command:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while loading your playlist: ${error.message}`)
        ],
      });
    }
  },
};