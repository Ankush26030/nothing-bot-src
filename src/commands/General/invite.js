const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
module.exports = {
  name: 'invite',
  category: 'General',
  aliases: ['inv'],
  cooldown: 5,
  description: '',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    return message.reply({
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Admin Perms")
            .setURL(
              `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=37088600&scope=bot%20applications.commands`
            ),
          new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Require Perms")
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=37080065&scope=bot`)
        ),
      ],
    });
  }
}