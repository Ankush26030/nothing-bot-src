const { EmbedBuilder } = require('discord.js');
const Prefix = require('../../models/prefix'); // Adjust the path if necessary
module.exports = {
  name: 'prefix',
  category: 'Settings',
  aliases: ['pre'],
  cooldown: 5,
  description: 'Change the prefix for the server.',
  args: false,
  usage: 'prefix <prefix>',
  userPrams: ['ManageGuild'],
  botPrams: ['ManageGuild'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    let data = await Prefix.findOne({ where: { id: message.guildId } });
    const pre = args.join(' ').trim();
    
    let currentPrefix;
    if (!data || !data.prefix) {
      currentPrefix = client.config.prefix;
    } else {
      currentPrefix = data.prefix;
    }
    // If no prefix is provided, show current prefix
    if (!pre) {
      const currentPrefixEmbed = new EmbedBuilder()
        .setColor('#2f3136')
        .setTitle('Current Prefix')
        .setDescription(`The current prefix for this server is \`${currentPrefix}\``)
        .setTimestamp();
      
      return message.channel.send({ embeds: [currentPrefixEmbed] });
    }
    
    // Check if prefix is too long
    if (pre.length >= 4) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('The prefix cannot be longer than 3 characters!')
        .setTimestamp();
      
      return message.reply({ embeds: [errorEmbed] });
    }
    
    // Check for emoji in the prefix
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    if (emojiRegex.test(pre)) {
      const emojiErrorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('Emojis are not allowed in the prefix!')
        .setTimestamp();
      
      return message.reply({ embeds: [emojiErrorEmbed] });
    }
    
    // Update or create prefix data
    if (data) {
      data.oldPrefix = prefix;
      data.prefix = pre;
      await data.save();
    } else {
      data = await Prefix.create({
        id: message.guildId,
        prefix: pre,
        oldPrefix: currentPrefix,
      });
    }
    // Update the prefix in the client's map
    client.prefixes.set(message.guildId, pre);
    // Send success message
    const successEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Prefix Updated')
      .setDescription(`Successfully updated the prefix to \`${pre}\``)
      .addFields(
        { name: 'Old Prefix', value: `\`${currentPrefix}\``, inline: true },
        { name: 'New Prefix', value: `\`${pre}\``, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    return message.reply({ embeds: [successEmbed] });
  }
};