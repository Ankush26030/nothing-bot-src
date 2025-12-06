const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
module.exports = {
  name: 'sources',
  category: 'Sources',
  aliases: ['src'],
  cooldown: 5,
  description: '',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const embed = new EmbedBuilder()
    .setColor(client.ankushcolor)
    .setAuthor({
        name: message.author.username || "Unknown User",
        iconURL: message.author.displayAvatarURL( { dynamic : true }),
      })
    .setDescription(`**Link Based Supported Sources**\n\`Spotify\`, \`Youtube\`, \`SoundCloud\``)
    .setTimestamp()

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Spotify').setStyle(ButtonStyle.Link).setURL(`https://open.spotify.com`),
        new ButtonBuilder().setLabel('Youtube').setStyle(ButtonStyle.Link).setURL(`https://youtube.com`),
        new ButtonBuilder().setLabel('SoundCloud').setStyle(ButtonStyle.Link).setURL(`https://soundcloud.com`)
    )
    return message.channel.send({ embeds: [embed], components: [row] })
  }
}