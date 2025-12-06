const { EmbedBuilder } = require("discord.js");
const axios = require('axios');

module.exports = {
  name: "banner",
  category: "Settings",
  aliases: ["userbanner"],
  description: "Display user's banner",
  args: false,
  usage: "[user mention/ID]",
  userPerms: [],
  execute: async (message, args, client, prefix) => {
    try {
      let user = message.mentions.users.first() 
        || (args[0] && await client.users.fetch(args[0]).catch(() => null)) 
        || message.author;

      const response = await axios.get(`https://discord.com/api/users/${user.id}`, {
        headers: { Authorization: `Bot ${client.token}` }
      });

      const { banner, banner_color } = response.data;

      if (banner) {
        const extension = banner.startsWith("a_") ? '.gif' : '.png';
        const bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}${extension}?size=4096`;

        const bannerEmbed = new EmbedBuilder()
          .setAuthor({ 
            name: `${user.tag}'s Banner`, 
            iconURL: user.displayAvatarURL({ size: 256 }) 
          })
          .setImage(bannerURL)
          .setColor(banner_color || client.ankushcolor)
          .setFooter({ text: `Requested by ${message.author.tag}` })
          .setTimestamp();

        message.reply({ embeds: [bannerEmbed] });
      } else {
        const noBannerEmbed = new EmbedBuilder()
          .setDescription(`**${user.username}** doesn't have a banner`)
          .setColor(client.ankushcolor)
          .setFooter({ text: `Requested by ${message.author.tag}` });

        message.reply({ embeds: [noBannerEmbed] });
      }
    } catch (error) {
      console.error('Banner fetch error:', error);
      message.reply({ 
        content: "Failed to fetch banner. Please try again later.", 
        ephemeral: true 
      });
    }
  }
};