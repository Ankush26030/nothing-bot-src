const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'skip',
  aliases: ['s'],
  category: 'Music',
  description: 'To skip the current playing song.',
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
        .setDescription('No song is currently playing in this guild.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (player.shoukaku.paused) {
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription('The song is currently paused. Please unpause to skip.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const title = player.queue.current.title.length > 20
      ? player.queue.current.title.slice(0, 20) + "....."
      : player.queue.current.title + ".....";

    if (!args[0]) {
      await player.skip();
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription(`Skipped the song: ${title}`)
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (isNaN(args[0])) {
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription('Please provide a valid number of songs to skip.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (args[0] > player.queue.length) {
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription('The number of songs to skip exceeds the queue length.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    player.queue.remove(0, parseInt(args[0]));
    player.skip();

    let embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription(`Skipped ${args[0]} song(s) from the queue.`)
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  },
};