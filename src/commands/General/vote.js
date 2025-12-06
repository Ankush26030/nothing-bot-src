const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
module.exports = {
  name: 'vote',
  category: 'General',
  aliases: ['upvote', 'rate', 'support'],
  cooldown: 5,
  description: 'Get voting links to support the bot',
  args: false,
  usage: '',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      // Voting platform links
      const voteLinks = {
        discordbotlist: client.config?.links?.dbl || `https://discordbotlist.com/bots/${client.user.id}/upvote`
      };
      // Create the voting embed
      const voteEmbed = new EmbedBuilder()
        .setColor(client.config?.embedColor || '#ff0000')
        .setAuthor({
          name: `Vote for ${client.user.username}`,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
        .setDescription(`
          🗳️ **Support Us By Voting!**
          
          Your vote helps us grow and reach more users.
          Vote now to:
          • Support our development team
          • Help others discover ${client.user.username}
          • Get exclusive vote rewards (if enabled)
          • Show your appreciation for our service
          
          Click the button below to vote! 💖
          You can vote every 12 hours.
        `)
        .setFooter({
          text: `Requested by ${message.author.tag} • Thanks for your support!`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();
      // Create voting button for DBL
      const voteButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Vote on DBL')
          .setStyle(ButtonStyle.Link)
          .setURL(voteLinks.discordbotlist),
      );
      // Send the message with embed and components
      return await message.reply({
        embeds: [voteEmbed],
        components: [voteButtons],
        ephemeral: false
      });
    } catch (error) {
      console.error('Error in vote command:', error);
      return message.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true
      });
    }
  }
};