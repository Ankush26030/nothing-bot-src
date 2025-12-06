const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { convertTime } = require('../../utils/convert.js');

module.exports = {
  name: 'src-jiosaavn',
  category: 'Sources',
  aliases: ['jiosaavn', 'jio'],
  cooldown: 5,
  description: 'Plays a song or playlist from JioSaavn.',
  args: true,
  usage: '[song name or song link]',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {

    if (
      !message.guild.members.me.permissions.has(
        PermissionsBitField.resolve(["Speak", "Connect"])
      )
    )
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: `| I don't have enough permissions to execute this command! Please give me permission to Connect or Speak.`,
              iconURL: client.user.displayAvatarURL({ dynamic: true })
            }),
        ],
      });
      
    const { channel } = message.member.voice;
      
    if (
      !message.guild.members.cache
        .get(client.user.id)
        .permissionsIn(channel)
        .has(PermissionsBitField.resolve(["Speak", "Connect"]))
    )
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: `| I don't have enough permissions connect your VC! Please give me permission to Connect or Speak.`,
              iconURL: client.user.displayAvatarURL({ dynamic: true })
            }),
        ],
      });

    const query = args.join(' ');

    const player = await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel.id,
      textId: message.channel.id,
      deaf: true,
    });

    const result = await player.search(query, { engine: "jiosaavn", requester: message.author });

    const nomatch = new EmbedBuilder()
      .setAuthor({
        name: message.author.username || "Unknown User",
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setColor(client.ankushcolor)
      .setDescription(`<:x_cross:1250674944057278535> No results found for \`${query}\`.`)

    if (!result.tracks.length) return message.reply({ embeds: [nomatch] });

    const tracks = result.tracks;
    const queueNumber = player.queue.length;

    if (result.type === 'PLAYLIST') for (let track of tracks) player.queue.add(track);
    else player.queue.add(tracks[0]);

    if (!player.playing && !player.paused) player.play();
    
    return message.reply(
      result.type === 'PLAYLIST' ? 
      { 
        embeds: [
          new EmbedBuilder()
            .setColor(client.embedColor)
            .setAuthor({
              name: `| Loaded ${tracks.length} songs in the queue.`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `<:x_tick:1250674883080224768> [**${result.playlistName}**](https://discord.gg/w77ymEU82a) requested by ${tracks[0].requester ? tracks[0].requester : `<@${client.user.id}>`}`,
            ),
        ],
      } : 
      {
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: `| Song Added to Queue #${queueNumber}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_tick:1250674883080224768> [**${tracks[0].title}**](https://discord.gg/w77ymEU82a) requested by ${tracks[0].requester ? tracks[0].requester : `<@${client.user.id}>`}`)
        ],
      },
    );
  },
};