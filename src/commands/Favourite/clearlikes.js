const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const FavPlay = require('../../models/playlist');

module.exports = {
  name: 'clearlikes',
  category: 'Favourite',
  description: 'Clear all songs from your favorites playlist',
  args: false,
  cooldown: 10,
  usage: '',
  userParams: [],
  botParams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client) => {
    try {
      const Name = "Fav";
      
      // Get user's favorites playlist
      const data = await FavPlay.findOne({ 
        where: { 
          userId: message.author.id, 
          playlistName: Name 
        } 
      });

      // Check if playlist exists
      if (!data) {
        return message.reply({ 
          content: "❌ | You don't have a favorites playlist yet!",
          ephemeral: true 
        });
      }

      // Check if playlist is already empty
      if (!data.playlist || data.playlist.length === 0) {
        return message.reply({ 
          content: "❌ | Your favorites playlist is already empty!",
          ephemeral: true 
        });
      }

      // Create dropdown menu for confirmation
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('clear_favorites_confirmation')
        .setPlaceholder('Please select an option')
        .addOptions([
          {
            label: 'Yes, clear all favorites',
            description: `Clear all ${data.playlist.length} songs from favorites`,
            value: 'confirm',
            emoji: '✅'
          },
          {
            label: 'No, keep my favorites',
            description: 'Cancel this operation',
            value: 'cancel',
            emoji: '❌'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      // Create confirmation embed
      const confirmEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Clear Favorites Confirmation')
        .setDescription(`Are you sure you want to clear all ${data.playlist.length} songs from your favorites?`)
        .setFooter({ text: 'Select an option from the dropdown menu below (expires in 30 seconds)' })
        .setTimestamp();

      // Send the message with dropdown
      const confirmMsg = await message.reply({ 
        embeds: [confirmEmbed],
        components: [row],
        ephemeral: true 
      });

      // Create collector for dropdown interaction
      const collector = confirmMsg.createMessageComponentCollector({ 
        componentType: ComponentType.StringSelect,
        time: 30000,
        max: 1
      });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: '❌ | This confirmation is not for you!',
            ephemeral: true
          });
        }

        if (interaction.values[0] === 'confirm') {
          // Update database with empty playlist
          try {
            await FavPlay.update(
              { playlist: [] },
              {
                where: {
                  userId: message.author.id,
                  playlistName: Name,
                },
              }
            );

            // Create success embed
            const successEmbed = new EmbedBuilder()
              .setColor('#00ff00')
              .setTitle('✅ Favorites Cleared')
              .setDescription(`Successfully cleared all songs from your favorites playlist!`)
              .setTimestamp();

            // Update the original message
            await interaction.update({ 
              embeds: [successEmbed],
              components: [] 
            });
          } catch (error) {
            console.error('Clear favorites error:', error);
            await interaction.update({ 
              content: '❌ | Failed to clear your favorites playlist.',
              embeds: [],
              components: []
            });
          }
        } else {
          // User cancelled
          const cancelEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('❌ Action Cancelled')
            .setDescription('Your favorites playlist remains unchanged.')
            .setTimestamp();

          await interaction.update({ 
            embeds: [cancelEmbed],
            components: [] 
          });
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Confirmation Timeout')
            .setDescription('You took too long to confirm. Your favorites playlist remains unchanged.')
            .setTimestamp();

          // Update the original message if no interaction happened
          confirmMsg.edit({ 
            embeds: [timeoutEmbed],
            components: [] 
          }).catch(e => console.error('Failed to update timeout message:', e));
        }
      });
    } catch (error) {
      console.error('Clear likes command error:', error);
      return message.reply({ 
        content: '❌ | An error occurred while processing your request.',
        ephemeral: true 
      });
    }
  }
};