const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { IgnoreChannel } = require('../../database');
const { hasVotePermission } = require('../../utils/voteCheck');

module.exports = {
  name: 'ignorechannel',
  category: "Settings",
  aliases: ['ignore'],
  description: 'Manage channels where bot commands are ignored',
  usage: '<add/remove/list>',
  args: true,
  userPrams: ['ManageGuild'],
  botPrams: ['EmbedLinks'],
  
  async execute(message, args, client, prefix) {
    // Check if user has voted
    const hasVoted = await hasVotePermission(message.author.id, client);
    if (!hasVoted) {
      return message.reply("This command requires you to vote for the bot! Use the `vote` command to learn more.");
    }
    
    const subCommand = args[0]?.toLowerCase();
    
    if (!['add', 'remove', 'list'].includes(subCommand)) {
      const helpEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setTitle('Ignore Channel Command')
        .setDescription('Configure channels where the bot will ignore commands')
        .addFields([
          { name: 'Usage', value: `\`${prefix}ignorechannel <add/remove/list> [channel]\`` },
          { name: 'Examples', value: 
            `\`${prefix}ignorechannel add #general\` - Ignore commands in #general\n` +
            `\`${prefix}ignorechannel remove #general\` - Stop ignoring commands in #general\n` +
            `\`${prefix}ignorechannel list\` - List all ignored channels`
          }
        ]);
      return message.reply({ embeds: [helpEmbed] });
    }

    // List all ignored channels
    if (subCommand === 'list') {
      const ignoredChannels = await IgnoreChannel.findAll({
        where: { guildId: message.guild.id }
      });
      
      if (ignoredChannels.length === 0) {
        const noChannelsEmbed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setTitle('Ignored Channels')
          .setDescription('There are no ignored channels in this server.')
          .setTimestamp();
        return message.reply({ embeds: [noChannelsEmbed] });
      }
      
      const channelList = ignoredChannels.map(ch => `<#${ch.channelId}>`).join('\n');
      const listEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setTitle('Ignored Channels')
        .setDescription(`Commands are ignored in the following channels:\n${channelList}`)
        .setTimestamp();
      return message.reply({ embeds: [listEmbed] });
    }
    
    // Get the target channel
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    
    if (!channel) {
      const noChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Channel Not Found')
        .setDescription('Please mention a valid channel or provide a valid channel ID.')
        .setTimestamp();
      return message.reply({ embeds: [noChannelEmbed] });
    }
    
    // Add channel to ignored list
    if (subCommand === 'add') {
      const existing = await IgnoreChannel.findOne({
        where: { 
          guildId: message.guild.id,
          channelId: channel.id
        }
      });
      
      if (existing) {
        const alreadyIgnoredEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Channel Already Ignored')
          .setDescription(`<#${channel.id}> is already in the ignored channels list.`)
          .setTimestamp();
        return message.reply({ embeds: [alreadyIgnoredEmbed] });
      }
      
      await IgnoreChannel.create({
        guildId: message.guild.id,
        channelId: channel.id
      });
      
      const addedEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setTitle('Channel Added')
        .setDescription(`<#${channel.id}> has been added to the ignored channels list.`)
        .setTimestamp();
      return message.reply({ embeds: [addedEmbed] });
    }
    
    // Remove channel from ignored list
    if (subCommand === 'remove') {
      const existing = await IgnoreChannel.findOne({
        where: { 
          guildId: message.guild.id,
          channelId: channel.id
        }
      });
      
      if (!existing) {
        const notIgnoredEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Channel Not Ignored')
          .setDescription(`<#${channel.id}> is not in the ignored channels list.`)
          .setTimestamp();
        return message.reply({ embeds: [notIgnoredEmbed] });
      }
      
      await IgnoreChannel.destroy({
        where: { 
          guildId: message.guild.id,
          channelId: channel.id
        }
      });
      
      const removedEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setTitle('Channel Removed')
        .setDescription(`<#${channel.id}> has been removed from the ignored channels list.`)
        .setTimestamp();
      return message.reply({ embeds: [removedEmbed] });
    }
  }
};