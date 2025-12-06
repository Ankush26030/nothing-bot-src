const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'replay',
  aliases: ['rplay'],
  category: 'Music',
  description: 'Replays the current song from the beginning.',
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

    if (!player || !player.queue.current) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('No song/s currently playing within this guild.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const songTitle =
      player.queue.current.title.length > 30
        ? `${player.queue.current.title.slice(0, 30)}...`
        : player.queue.current.title;

    if (!player.queue.current.isSeekable) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('The current song cannot be replayed because it is not seekable.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    player.shoukaku.seekTo(0);

    const embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({
        name: message.author.username || 'Unknown User',
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`Replaying **${songTitle}** from the beginning.`)
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  },
};
