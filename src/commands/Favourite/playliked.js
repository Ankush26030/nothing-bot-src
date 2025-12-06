const { EmbedBuilder } = require('discord.js');
const Playlist = require('../../models/playlist');

module.exports = {
  name: 'playliked',
  category: 'Favourite',
  description: 'Play songs from your favorites playlist',
  args: false,
  cooldown: 5,
  usage: '',
  userParams: [],
  botParams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client) => {
    try {
      const Name = "Fav";
      
      // Find user's playlist
      const data = await Playlist.findOne({ 
        where: { 
          UserId: message.author.id, 
          PlaylistName: Name 
        } 
      });

      // Check if playlist exists
      if (!data || !data.playlist || data.playlist.length === 0) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ff0000')
              .setDescription("❌ | You don't have any liked songs in your favorites!")
              .setTimestamp()
          ],
        });
      }

      // Create player
      const player = await client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: message.member.voice.channel.id,
        textId: message.channel.id,
        deaf: true,
      });

      if (!player) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ff0000')
              .setDescription("❌ | Failed to create music player!")
              .setTimestamp()
          ],
        });
      }

      // Send initial loading message
      const loadingMessage = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription("🎵 | Loading your favorite tracks...")
            .setTimestamp()
        ],
      });

      let successCount = 0;
      let failedCount = 0;

      // Process each track in the playlist
      for (const track of data.playlist) {
        try {
          const searchResult = await player.search(
            track.uri ? track.uri : track.title, 
            { requester: message.author }
          );

          switch (searchResult.type) {
            case "TRACK":
            case "SEARCH":
            case "PLAYLIST":
              if (searchResult.tracks && searchResult.tracks[0]) {
                player.queue.add(searchResult.tracks[0]);
                if (!player.playing && !player.paused) {
                  await player.play();
                }
                successCount++;
              } else {
                failedCount++;
              }
              break;
            default:
              failedCount++;
              break;
          }
        } catch (error) {
          console.error(`Error loading track: ${track.title}`, error);
          failedCount++;
        }

        // Update loading message periodically
        if ((successCount + failedCount) % 5 === 0) {
          await loadingMessage.edit({
            embeds: [
              new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription(`🎵 | Loading tracks... ${successCount + failedCount}/${data.playlist.length}`)
                .setTimestamp()
            ],
          }).catch(() => {});
        }
      }

      // Handle results
      if (successCount === 0) {
        if (player && !player.queue.current) {
          player.destroy();
        }
        
        return await loadingMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setColor('#ff0000')
              .setDescription("❌ | Failed to load any tracks from your favorites.")
              .setTimestamp()
          ],
        });
      }

      // Create success embed
      const successEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🎵 Playing Favorites')
        .setDescription(`Successfully loaded ${successCount} tracks from your favorites!`)
        .addFields(
          { name: 'Loaded Tracks', value: `${successCount}/${data.playlist.length}`, inline: true },
          { name: 'Failed Tracks', value: `${failedCount}`, inline: true },
          { name: 'Queue Length', value: `${player.queue.length}`, inline: true }
        )
        .setTimestamp();

      return await loadingMessage.edit({
        content: null,
        embeds: [successEmbed],
      });

    } catch (error) {
      console.error('Playliked command error:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription("❌ | An error occurred while playing your favorites.")
            .setTimestamp()
        ],
      });
    }
  },
};
