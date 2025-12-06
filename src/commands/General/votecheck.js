const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios"); // Make sure to install this package

module.exports = {
  name: 'votecheck',
  category: 'General',
  aliases: ['checkvote'],
  cooldown: 10,
  description: 'Checks if you have voted for the bot on Discord Bot List',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      // Get user ID
      const userId = message.author.id;
      
      // API token
      const apiToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoxLCJpZCI6IjEyMzQ1OTI1MzkzMjQwNTk3MDkiLCJpYXQiOjE3NDUyMDU2MjJ9.M11ZwPs_r7nUPWH1HNOXiLkX1HJNMIzfCPYnkqwehaU";
      
      // Initial response
      const sent = await message.reply({ content: "Checking your vote status..." });
      
      // Check if user has voted
      const response = await axios.get(`https://discordbotlist.com/api/v1/bots/${client.user.id}/upvotes`, {
        headers: {
          'Authorization': `Bot ${apiToken}`
        }
      });
      
      // Check if the user has voted
      const hasVoted = response.data.upvotes.some(vote => vote.user_id === userId);
      
      // Create vote button
      const voteButton = new ButtonBuilder()
        .setLabel('Vote for Bot')
        .setURL(`https://discordbotlist.com/bots/${client.user.id}/upvote`)
        .setStyle(ButtonStyle.Link);
      
      const row = new ActionRowBuilder().addComponents(voteButton);
      
      // Create embed based on vote status
      const voteEmbed = new EmbedBuilder()
        .setColor(hasVoted ? '#00FF00' : '#FF0000')
        .setTitle('Vote Status')
        .setDescription(hasVoted 
          ? `✅ Thank you for voting for ${client.user.username}!` 
          : `❌ You haven't voted for ${client.user.username} yet!`)
        .setFooter({ text: `Requested by ${message.author.tag}` })
        .setTimestamp();
      
      // Add cooldown info if they've voted
      if (hasVoted) {
        // Try to get the vote timestamp if available
        const userVote = response.data.upvotes.find(vote => vote.user_id === userId);
        if (userVote && userVote.timestamp) {
          const voteTime = new Date(userVote.timestamp);
          const nextVoteTime = new Date(voteTime.getTime() + 12 * 60 * 60 * 1000); // 12 hours cooldown
          
          voteEmbed.addFields(
            { name: 'Last Vote', value: `<t:${Math.floor(voteTime.getTime() / 1000)}:R>`, inline: true },
            { name: 'Next Vote', value: `<t:${Math.floor(nextVoteTime.getTime() / 1000)}:R>`, inline: true }
          );
        }
      } else {
        voteEmbed.addFields(
          { name: 'Vote Benefits', value: 'Voting gives you access to exclusive commands and features!' }
        );
      }
      
      // Edit the initial message with the embed and button
      await sent.edit({ 
        content: null, 
        embeds: [voteEmbed],
        components: [row]
      });
      
    } catch (error) {
      console.error('Error checking vote status:', error);
      message.reply({ content: 'Failed to check your vote status. Please try again later.' });
    }
  }
};