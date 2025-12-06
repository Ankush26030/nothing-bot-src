const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const pkg = require("discord.js")
const  { splitMessage } = pkg;
const { inspect } = require("util")

module.exports = {
  name: 'eval',
  category: 'Owner',
  aliases: ['ankush'],
  cooldown: 5,
  description: '',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: true,
  execute: async (message, args, client, prefix) => {
const code = args.join(" ");
    if (!code) {
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription(`Please provide code to eval!`);
      return message.channel.send({ embeds: [embed] });
    }
    try {
      let evaled;
      try {
        evaled = await eval(code);
        evaled = inspect(evaled, { depth: 0 });
      } catch (e) {
        evaled = inspect(e, { depth: 0 });
      }
      if (typeof evaled !== "string") {
        evaled = inspect(evaled, { depth: 0 });
      }
      if (evaled.includes(client.config.token)) {
        evaled = evaled.replace(client.token, "Bakchodi Mat Kar Laude");
      }
      if (evaled.includes(client.config.mongourl)) {
        evaled = evaled.replace(client.config.mongourl, "Ye Buddha Mere Beech Mein Bahut Bolta Hai");
      }
      const evalmsg = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`\`\`\`js\n${evaled}\n\`\`\``)
      return message.channel.send({
        embeds: [evalmsg]
      });
    } catch (e) {
      const evaler = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`\`\`\`js\n${e}\n\`\`\``)
      return message.channel.send({
        embeds: [evaler]
      });
    }
  },
};
