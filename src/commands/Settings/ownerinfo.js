const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ownerinfo",
  category: "Settings",
  aliases: ["dev", "developer"],
  description: "Displays information about the bot owner.",
  args: false,
  usage: "",
  userPerms: [],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      const ownerID = client.config.ownerID; // Ensure this is set in your bot's configuration
      const owner = await client.users.fetch('239496212699545601'); // Fetch the user by ID
      if (!owner) {
        return message.reply("I couldn't find the owner. Please check the owner ID in the configuration.");
      }

      const embed = new EmbedBuilder()
        .setAuthor({ name: `Owner Information`, iconURL: client.user.displayAvatarURL() })
        .setFooter({ text: `Requested By ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setColor('#ff0000')
        .setTitle("Hey, It's A Quality Music Bot With Breathtaking Feature")
        .setDescription(`<:flame_owner:1291123571443236864> Here Is My Owner & Developer [${owner.tag}](https://discord.com/users/${ownerID})`);

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching owner information: ", error);
      message.reply("An error occurred while trying to fetch the owner information.");
    }
  },
};