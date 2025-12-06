const { EmbedBuilder } = require('discord.js');
const { convertTime } = require('../../utils/convert.js');

module.exports = {
  name: 'queue',
  category: 'Music',
  aliases: ['q'],
  description: 'Show the music queue and now playing.',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player || !player.queue.current) {
      const noPlayerEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription('There is no music currently playing. Use the play command to add songs to the queue.')
        .setTimestamp();

      return message.reply({ embeds: [noPlayerEmbed] });
    }

    const totalSongsPerPage = 5;
    const totalPages = Math.ceil(player.queue.length / totalSongsPerPage);
    let page = 1;

    if (args[0]) {
      const pageArg = parseInt(args[0], 10);
      if (isNaN(pageArg) || pageArg < 1 || pageArg > totalPages) {
        const invalidPageEmbed = new EmbedBuilder()
          .setColor(client.ankushcolor)
          .setAuthor({
            name: message.author.username || "Unknown User",
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(`Invalid page number. Please provide a number between 1 and ${totalPages}.`);

        return message.channel.send({ embeds: [invalidPageEmbed] });
      }

      page = pageArg;
    }

    const start = (page - 1) * totalSongsPerPage;
    const end = page * totalSongsPerPage;
    const tracks = player.queue.slice(start, end);

    const queueEmbed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setTitle('Music Queue')
      .setDescription(`Now Playing: **${player.queue.current.title}**`)
      .setFooter({ text: `Page ${page} of ${totalPages}` });

    tracks.forEach((track, index) => {
      queueEmbed.addFields({
        name: `${start + index + 1}. ${track.title}`,
        value: `Artist: ${track.author}
Duration: ${track.isStream ? '◉ LIVE' : convertTime(track.length)}
Requested by: ${track.requester.username}`,
      });
    });

    return message.reply({ embeds: [queueEmbed] });
  },
};
