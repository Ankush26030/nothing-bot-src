const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
module.exports = {
  name: "moveme",
  category: "Settings",
  description: "Moves you to the bots voice channel!",
  owner: false,
  execute: async (message, args, client, prefix) => {
    let channel = message.member.voice.channel;
    let botchannel = message.guild.members.me.voice?.channel;
    
    // Check if bot is not in a voice channel
    if(!botchannel) {
      const ifkf = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription(`I am connected nowhere`)
      return message.channel.send({embeds: [ifkf]})
    }
    
    // Check if user is not in a voice channel
    if(!channel) {
      const dd = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription(`Please Connect to a voice channel first`)
      return message.channel.send({embeds: [dd]})
    }
    
    // Check if bot's voice channel is full
    if(botchannel.userLimit >= botchannel.members.length) {
      const idkd = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription(`Sorry my channel is full, I cant move you`)
      return message.channel.send({embeds: [idkd]})
    }
    
    // Check if user is already in bot's channel
    if(botchannel.id == channel.id) {
      const tt = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription(`You are already in my channel `)
      return message.channel.send({embeds: [tt]})
    }
    
    // Move user to bot's channel
    message.member.voice.setChannel(botchannel);
    const ioop = new EmbedBuilder()
    .setColor(client.ankushcolor)
    .setDescription(`Succesfully Moved You To <#${botchannel.id}>`)
    return message.channel.send({embeds: [ioop]});
  }
}