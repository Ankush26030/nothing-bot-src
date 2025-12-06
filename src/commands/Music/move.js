const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'move',
  category: 'Music',
  aliases: ['skipto', 'jump'],
  description: 'Move a track to a new position in the queue.',
  args: true,
  usage: '<track>',
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
        .setDescription('No song is currently playing in this guild.');
      return message.reply({ embeds: [embed] });
    }

    const position = Number(args[0]);
    if (!position || position > player.queue.length || position <= 0) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`Invalid position! Please provide a number between 1 and ${player.queue.length}.`);
      return message.reply({ embeds: [embed] });
    }

    if (position === 1) {
      player.skip();
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || 'Unknown User',
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('Track has been moved to the first position and skipped.');
      return message.reply({ embeds: [embed] });
    }

    const track = player.queue.splice(position - 1, 1)[0]; // Remove track from the given position
    player.queue.unshift(track); // Add the track to the start of the queue
    player.skip(); // Skip the current track

    const embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({
        name: message.author.username || 'Unknown User',
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`Moved track to position ${position} and skipped the current track.`);

    return message.reply({ embeds: [embed] });
  },
};
