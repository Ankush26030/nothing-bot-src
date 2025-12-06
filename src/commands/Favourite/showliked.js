const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const FavPlay = require('../../models/playlist');

module.exports = {
  name: 'showliked',
  aliases: ['liked', 'favorites', 'favourites', 'fav'],
  category: 'Favourite',
  description: 'Show all songs in your favorites playlist',
  args: false,
  cooldown: 5,
  usage: '[page]',
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
          content: "❌ | You don't have a favorites playlist yet! Use the `like` command while a song is playing to add it to your favorites.",
          ephemeral: true 
        });
      }

      // Check if playlist is empty
      if (!data.playlist || data.playlist.length === 0) {
        return message.reply({ 
          content: "❌ | Your favorites playlist is empty! Use the `like` command while a song is playing to add it to your favorites.",
          ephemeral: true 
        });
      }

      // Pagination settings
      const songsPerPage = 10;
      const playlist = data.playlist;
      const totalPages = Math.ceil(playlist.length / songsPerPage);
      let page = args[0] ? parseInt(args[0]) : 1;
      
      // Validate page number
      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      // Calculate start and end indices for current page
      const startIndex = (page - 1) * songsPerPage;
      const endIndex = Math.min(startIndex + songsPerPage, playlist.length);
      const currentPageSongs = playlist.slice(startIndex, endIndex);

      // Create the embed for current page
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(`${message.author.username}'s Favorite Songs`)
        .setDescription(`Showing page ${page} of ${totalPages} (${playlist.length} total songs)`)
        .setTimestamp();

      // Add songs to embed
      currentPageSongs.forEach((song, index) => {
        const songNumber = startIndex + index + 1;
        
        embed.addFields({
          name: `${songNumber}. ${song.title}`,
          value: `**Artist:** ${song.author}\n**Duration:** ${formatDuration(song.duration)}`,
          inline: false
        });
      });

      // Create pagination components if needed
      let components = [];
      if (totalPages > 1) {
        const row = new ActionRowBuilder();
        
        // Create dropdown menu for page selection
        const pageSelect = new StringSelectMenuBuilder()
          .setCustomId('page_select')
          .setPlaceholder(`Page ${page} of ${totalPages}`)
          .setMinValues(1)
          .setMaxValues(1);
        
        // Add options for each page (up to 25 which is Discord's limit)
        const maxPageOptions = Math.min(totalPages, 25);
        for (let i = 1; i <= maxPageOptions; i++) {
          pageSelect.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(`Page ${i}`)
              .setDescription(`${songsPerPage * (i-1) + 1}-${Math.min(songsPerPage * i, playlist.length)} of ${playlist.length} songs`)
              .setValue(`${i}`)
              .setDefault(i === page)
          );
        }
        
        row.addComponents(pageSelect);
        components.push(row);
      }

      // Send the initial message with page selector (no buttons)
      const response = await message.reply({
        embeds: [embed],
        components: components,
        ephemeral: true
      });

      // Set up collector for page selection
      const filter = i => i.user.id === message.author.id && i.customId === 'page_select';
      
      const collector = response.createMessageComponentCollector({ filter, time: 120000 });

      collector.on('collect', async (interaction) => {
        page = parseInt(interaction.values[0]);
        
        // Calculate new page content
        const newStartIndex = (page - 1) * songsPerPage;
        const newEndIndex = Math.min(newStartIndex + songsPerPage, playlist.length);
        const newPageSongs = playlist.slice(newStartIndex, newEndIndex);

        // Update embed
        const newEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle(`${message.author.username}'s Favorite Songs`)
          .setDescription(`Showing page ${page} of ${totalPages} (${playlist.length} total songs)`)
          .setTimestamp();

        // Add songs to new embed
        newPageSongs.forEach((song, index) => {
          const songNumber = newStartIndex + index + 1;
          
          newEmbed.addFields({
            name: `${songNumber}. ${song.title}`,
            value: `**Artist:** ${song.author}\n**Duration:** ${formatDuration(song.duration)}`,
            inline: false
          });
        });

        // Update pagination dropdown menu
        const newRow = new ActionRowBuilder();
        const newPageSelect = new StringSelectMenuBuilder()
          .setCustomId('page_select')
          .setPlaceholder(`Page ${page} of ${totalPages}`)
          .setMinValues(1)
          .setMaxValues(1);
        
        // Add options for each page (up to 25 which is Discord's limit)
        const maxPageOptions = Math.min(totalPages, 25);
        for (let i = 1; i <= maxPageOptions; i++) {
          newPageSelect.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(`Page ${i}`)
              .setDescription(`${songsPerPage * (i-1) + 1}-${Math.min(songsPerPage * i, playlist.length)} of ${playlist.length} songs`)
              .setValue(`${i}`)
              .setDefault(i === page)
          );
        }
        
        newRow.addComponents(newPageSelect);

        // Update message with new embed and pagination
        await interaction.update({
          embeds: [newEmbed],
          components: [newRow]
        });
      });

      collector.on('end', () => {
        // Remove components when collector expires
        response.edit({
          components: []
        }).catch(e => console.error('Failed to remove components:', e));
      });
    } catch (error) {
      console.error('Show liked command error:', error);
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