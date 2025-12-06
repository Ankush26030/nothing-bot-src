const { EmbedBuilder } = require('discord.js');
const { convertTime } = require("../../utils/convert");
const ms = require('ms');

module.exports = {
  name: 'rewind',
  aliases: ['rd', 'rw'],
  category: 'Music',
  description: 'Rewind the player to the provided timestamp.',
  args: false,
  usage: '<time>',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    // Check if there's a song playing
    if (!player.queue.current) {
      const noSongEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({ 
          name: message.author.username || "Unknown User", 
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription('No song/s currently playing within this guild.')
        .setTimestamp();
      
      return message.reply({ embeds: [noSongEmbed] });
    }

    // Check if song is seekable
    if (!player.queue.current.isSeekable) {
      const notSeekableEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Cannot Rewind')
        .setDescription('This track does not support rewinding.')
        .setFooter({ text: 'Try with a different song' })
        .setTimestamp();
      return message.reply({ embeds: [notSeekableEmbed] });
    }

    const song = player.queue.current;
    let position = 10000; // Default 10 seconds

    // Only try to parse time if arguments were provided
    if (args.length > 0) {
      const timeArg = args.join(" ");
      try {
        const parsedTime = ms(timeArg);
        if (parsedTime) {
          position = parsedTime;
        } else {
          const invalidTimeEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ Invalid Time Format')
            .setDescription('Please provide a valid time format (e.g., 10s, 1m, 2m30s)')
            .setTimestamp();
          return message.reply({ embeds: [invalidTimeEmbed] });
        }
      } catch (error) {
        const invalidTimeEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('⚠️ Invalid Time Format')
          .setDescription('Please provide a valid time format (e.g., 10s, 1m, 2m30s)')
          .setTimestamp();
        return message.reply({ embeds: [invalidTimeEmbed] });
      }
    }

    let seekPosition = player.shoukaku.position - position;

    // Check if seek position would be less than 0
    if (seekPosition <= 0) {
      const invalidPositionEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Invalid Rewind Time')
        .setDescription('Cannot rewind beyond the start of the track!')
        .addFields(
          { name: 'Current Position', value: `${convertTime(player.shoukaku.position)}`, inline: true },
          { name: 'Requested Rewind', value: `${convertTime(position)}`, inline: true }
        )
        .setTimestamp();
      return message.reply({ embeds: [invalidPositionEmbed] });
    }

    // Perform the seek
    player.shoukaku.seekTo(seekPosition);

    // Success embed
    const successEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('⏪ Rewound Track')
      .setDescription(`Successfully rewound **${song.title}**`)
      .addFields(
        { name: 'Rewound by', value: `${convertTime(position)}`, inline: true },
        { name: 'New Position', value: `${convertTime(seekPosition)}`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    return message.reply({ embeds: [successEmbed] });
  }
};