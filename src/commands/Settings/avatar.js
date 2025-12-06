const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "avatar",
  category: "Settings",
  aliases: ["av", "pfp"],
  description: "Display user avatar with download options",
  args: false,
  usage: "[user mention/ID]",
  userPerms: [],
  execute: async (message, args, client, prefix) => {
    // Determine the target user
    let user = message.mentions.users.first() 
      || (args[0] && await client.users.fetch(args[0]).catch(() => null)) 
      || message.author;

    // Check if user has an animated avatar
    const isAnimated = user.avatar?.startsWith('a_');

    // Generate avatar URLs for different formats
    const avatarURLs = {
      png: user.displayAvatarURL({ format: "png", dynamic: false, size: 4096 }),
      jpg: user.displayAvatarURL({ format: "jpg", dynamic: false, size: 4096 }),
      webp: user.displayAvatarURL({ format: "webp", dynamic: false, size: 4096 }),
      gif: isAnimated ? user.displayAvatarURL({ format: "gif", dynamic: true, size: 4096 }) : null
    };

    // Create embed with user avatar details
    const avatarEmbed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({ 
        name: `${user.tag}'s Avatar`, 
        iconURL: user.displayAvatarURL({ size: 256 }) 
      })
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    // Create download buttons (only show GIF if animated)
    const downloadButtons = [
      new ButtonBuilder()
        .setLabel("PNG")
        .setStyle(ButtonStyle.Link)
        .setURL(avatarURLs.png),
      new ButtonBuilder()
        .setLabel("JPG")
        .setStyle(ButtonStyle.Link)
        .setURL(avatarURLs.jpg),
      new ButtonBuilder()
        .setLabel("WEBP")
        .setStyle(ButtonStyle.Link)
        .setURL(avatarURLs.webp)
    ];

    // Add GIF button only if avatar is animated
    if (isAnimated) {
      downloadButtons.push(
        new ButtonBuilder()
          .setLabel("GIF")
          .setStyle(ButtonStyle.Link)
          .setURL(avatarURLs.gif)
      );
    }

    // Create action row with buttons
    const downloadRow = new ActionRowBuilder().addComponents(downloadButtons);

    // Send response with embed and download buttons
    message.reply({ 
      embeds: [avatarEmbed],
      components: [downloadRow]
    });
  }
};