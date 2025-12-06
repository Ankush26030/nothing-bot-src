const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const FavPlay = require('../../models/playlist');

module.exports = {
  name: 'like',
  category: 'Favourite',
  description: 'Save the current playing song to your favorites playlist',
  args: false,
  cooldown: 5,
  usage: '',
  userParams: [],
  botParams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client) => {
    try {
      // Get the player instance
      const player = client.manager.players.get(message.guild.id);
      if (!player?.queue?.current) {
        return message.reply({ 
          content: "❌ | There is no music playing right now!",
          ephemeral: true 
        });
      }

      const Name = "Fav";
      // Get user's playlist data
      let data = await FavPlay.findAll({ 
        where: { 
          userId: message.author.id, 
          playlistName: Name 
        } 
      });

      // Create new playlist if doesn't exist
      if (data.length <= 0) {
        try {
          await FavPlay.create({
            userName: message.author.username,
            userId: message.author.id,
            playlistName: Name,
            playlist: [],
          });
          
          data = await FavPlay.findAll({ 
            where: { 
              userId: message.author.id, 
              playlistName: Name 
            } 
          });
        } catch (error) {
          console.error('Playlist creation error:', error);
          return message.reply({ 
            content: '❌ | Failed to create your favorites playlist.',
            ephemeral: true 
          });
        }
      }

      // Check playlist limit
      const userData = await FavPlay.findAll({
        where: { userId: message.author.id },
      });

      if (userData.length >= 10) {
        const limitEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Playlist Limit Reached')
          .setDescription('You have reached the maximum limit of 10 playlists.')
          .setTimestamp();
        
        return message.reply({ 
          embeds: [limitEmbed],
          ephemeral: true 
        });
      }

      // Get current song
      const song = player.queue.current;
      
      // Check if song already exists in playlist
      const existingPlaylist = data[0]?.playlist || [];
      const songExists = existingPlaylist.some(track => track.uri === song.uri);
      
      if (songExists) {
        return message.reply({ 
          content: '❌ | This song is already in your favorites!',
          ephemeral: true 
        });
      }

      // Add new song
      const newSong = {
        title: song.title,
        uri: song.uri,
        author: song.author,
        duration: song.length,
        addedAt: new Date().toISOString()
      };

      const updatedPlaylist = [...existingPlaylist, newSong];

      // Update database
      try {
        await FavPlay.update(
          { playlist: updatedPlaylist },
          {
            where: {
              userId: message.author.id,
              playlistName: Name,
            },
          }
        );

        // Create success embed
        const successEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('✅ Added to Favorites')
          .setDescription(`Successfully added **${song.title}** to your favorites!`)
          .addFields(
            { name: 'Title', value: song.title, inline: true },
            { name: 'Artist', value: song.author, inline: true },
            { name: 'Duration', value: formatDuration(song.length), inline: true }
          )
          .setTimestamp();

        return message.reply({ 
          embeds: [successEmbed],
          ephemeral: true 
        });

      } catch (error) {
        console.error('Playlist update error:', error);
        return message.reply({ 
          content: '❌ | Failed to add song to your favorites.',
          ephemeral: true 
        });
      }
    } catch (error) {
      console.error('Like command error:', error);
      return message.reply({ 
        content: '❌ | An error occurred while processing your request.',
        ephemeral: true 
      });
    }
  }
};

// Helper function to format duration
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}