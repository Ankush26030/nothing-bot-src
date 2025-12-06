const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: 'support',
  category: 'General',
  aliases: ['server', 'help-server', 'discord'],
  cooldown: 5,
  description: 'Get support server invitation and helpful resources',
  args: false,
  usage: '',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      // Configuration
      const supportServerLink = client.config?.supportServer || 'https://discord.com/invite/w77ymEU82a';
      
      // Create the main embed
      const supportEmbed = new EmbedBuilder()
        .setColor(client.config?.embedColor || '#ff0000')
        .setAuthor({
          name: `${client.user.username} Support`,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
        .setDescription(`
          🌟 **Need help? We've got you covered!**
          
          Join our support server for:
          • 24/7 Support from our team
          • Bug reports and feature requests
          • Community events and giveaways
          • Latest updates and announcements
          • Connect with other users
          
          Click the buttons below to get started!
        `)
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      // Create buttons row
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Join Support Server')
          .setStyle(ButtonStyle.Link)
          .setURL(supportServerLink),
        
        new ButtonBuilder()
          .setLabel('Invite Bot')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
      );

      // Send the message with embed and components
      return await message.reply({
        embeds: [supportEmbed],
        components: [buttons],  // Removed statusRow since it wasn't defined
        ephemeral: false
      });
    } catch (error) {
      console.error('Error in support command:', error);
      return message.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true
      });
    }
  }
};