const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'remove',
  category: 'Music',
  aliases: ['rm'],
  description: 'Remove a song from the queue.',
  args: false,
  usage: '<Number of song in queue>',
  userPrams: [],
  cooldown: 3,
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

    if (!args[0] || isNaN(args[0])) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `Invalid input! Please provide the number of the song to remove from the queue. Usage: \`${prefix}remove <queue number>\`.`
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const position = Number(args[0]) - 1;

    if (position < 0 || position >= player.queue.length) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(
          `Invalid position! Please provide a number between 1 and ${player.queue.length}.`
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const song = player.queue[position];
    player.queue.splice(position, 1);

    const embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({
        name: message.author.username || 'Unknown User',
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `Removed **${song.title.length > 50 ? `${song.title.slice(0, 50)}...` : song.title}** from the queue.`
      )
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  },
};
