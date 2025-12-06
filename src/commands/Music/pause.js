const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "pause",
  category: "Music",
  description: "Pause the currently playing music",
  args: false,
  usage: "",
  userPrams: [],
  cooldown: 5,
  botPrams: ["EmbedLinks"],
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
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription("No song is currently playing in this guild.");
      return message.reply({ embeds: [embed] });
    }

    if (player.shoukaku.paused) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription("The player is already paused.");
      return message.reply({ embeds: [embed] });
    }

    await player.pause(true);

    const song = player.queue.current;
    const embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({
        name: message.author.username || "Unknown User",
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`The song **${song.title}** has been paused.`);

    return message.reply({ embeds: [embed] });
  },
};
