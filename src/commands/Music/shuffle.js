const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'shuffle',
  aliases: ['sh'],
  category: 'Music',
  description: 'Shuffles The queue!',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player.queue.current) {
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({ name: message.author.username || "Unknown User", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription('No song is currently playing in this guild.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (player.queue.length < 3) {
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription('There must be at least 3 songs in the queue to shuffle.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    player.queue.shuffle();

    let embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription('The queue has been shuffled!')
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  },
};
