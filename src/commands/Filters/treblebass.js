const { EmbedBuilder } = require("discord.js");

module.exports = {
 name: 'treblebass',
 category: 'Filters',
 cooldown: 5,
 description: 'Toggle treble and bass boost filter',
 args: false,
 usage: '',
 userPrams: [],
 botPrams: ['EmbedLinks'],
 owner: false,
 player: true,
 inVoiceChannel: true,
 sameVoiceChannel: true,
 execute: async (message, args, client, prefix) => {
   const player = client.manager.players.get(message.guild.id);
   
   // Check if a player exists
   if (!player) {
     const noPlayerEmbed = new EmbedBuilder()
       .setColor(client.ankushcolor)
       .setAuthor({
         name: message.author.username || "Unknown User",
         iconURL: message.author.displayAvatarURL({ dynamic: true })
       })
       .setDescription('❌ | No song is currently playing in this server.')
       .setTimestamp();
     return message.reply({ embeds: [noPlayerEmbed] });
   }

   try {
     // Toggle treblebass filter
     if (player.treblebass) {
       player.setTreblebass(false);
       const disabledEmbed = new EmbedBuilder()
         .setColor(client.ankushcolor)
         .setAuthor({
           name: message.author.username,
           iconURL: message.author.displayAvatarURL({ dynamic: true })
         })
         .setDescription('🎵 | Treble & Bass filter has been **disabled**')
         .addFields(
           { 
             name: 'Now Playing', 
             value: player.queue.current?.title || 'Unknown',
             inline: true 
           },
           { 
             name: 'Filter Status', 
             value: '⚪ Disabled',
             inline: true 
           }
         )
         .setFooter({
           text: 'Audio restored to normal balance'
         })
         .setTimestamp();
       return message.reply({ embeds: [disabledEmbed] });
     } else {
       player.setTreblebass(true);
       const enabledEmbed = new EmbedBuilder()
         .setColor(client.ankushcolor)
         .setAuthor({
           name: message.author.username,
           iconURL: message.author.displayAvatarURL({ dynamic: true })
         })
         .setDescription('🎵 | Treble & Bass filter has been **enabled**')
         .addFields(
           { 
             name: 'Now Playing', 
             value: player.queue.current?.title || 'Unknown',
             inline: true 
           },
           { 
             name: 'Filter Status', 
             value: '🔵 Enabled',
             inline: true 
           }
         )
         .setFooter({
           text: 'Enhanced treble and bass frequencies'
         })
         .setTimestamp();
       return message.reply({ embeds: [enabledEmbed] });
     }
   } catch (error) {
     console.error('Treblebass filter error:', error);
     
     const errorEmbed = new EmbedBuilder()
       .setColor('#ff0000')
       .setDescription('❌ | An error occurred while toggling the treble & bass filter.')
       .setTimestamp();
     return message.reply({ embeds: [errorEmbed] });
   }
 }
};