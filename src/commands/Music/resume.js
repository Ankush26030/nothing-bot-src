const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'resume',
  aliases: ['r'],
  category: 'Music',
  description: 'Resume currently playing music',
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
      player.queue.current.title.length > 20
        ? `${player.queue.current.title.slice(0, 20)}...`
        : player.queue.current.title;

    if (!player.shoukaku.paused) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('The music is already playing.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    await player.pause(false);

    const embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({
        name: message.author.username || 'Unknown User',
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`Resumed playing **${songTitle}**.`)
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  },
};
