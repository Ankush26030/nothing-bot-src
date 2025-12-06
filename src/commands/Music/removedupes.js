const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'removedupes',
  category: 'Music',
  description: 'Remove duplicate songs from the queue.',
  aliases: ['removedp', 'removeduplicate', 'remdupe'],
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

    const tracks = player.queue;
    const uniqueTracks = [];

    for (const track of tracks) {
      if (!uniqueTracks.some((t) => t.uri === track.uri)) {
        uniqueTracks.push(track);
      }
    }

    const removedCount = tracks.length - uniqueTracks.length;

    player.queue.clear();
    for (const track of uniqueTracks) {
      player.queue.add(track);
    }

    const embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({
        name: message.author.username || 'Unknown User',
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        removedCount > 0
          ? `Removed **${removedCount}** duplicate song(s) from the queue.`
          : 'No duplicate songs found in the queue.'
      )
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  },
};
