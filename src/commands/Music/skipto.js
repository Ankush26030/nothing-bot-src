const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'skipto',
  category: 'Music',
  aliases: ["move", "jump"],
  description: '',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {

       const player = client.manager.players.get(message.guild.id);
            if (!player.queue.current) {
               let thing = new EmbedBuilder().setColor(client.ankushcolor).setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL( { dynamic : true }),
              }).setDescription('There is no player for this guild, Please connect by using join command.')
              .setTimestamp();
               return message.reply({ embeds: [thing] });
            }

    const position = Number(args[0]);
    if (!position || position > player.queue.length || position < 0) {
        return message.reply({
         embeds: [
              new EmbedBuilder().setColor(client.ankushcolor).setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL( { dynamic : true }),
              })
              .setDescription(`Please provide me a valid number from the queue!`)
              .setTimestamp()
           ],
       });
    }

    if (args[0] == 1) player.skip();

    player.queue.splice(0, position - 1);
    await player.skip();

    return message.reply({
        embeds: [
            new EmbedBuilder().setColor(client.ankushcolor).setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL( { dynamic : true }),
              })
              .setDescription(`Successfully Skipped **${position}** number of tracks from the Queue.`)
              .setTimestamp()
        ],
    });
  }
}