const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: "serverleave",
    category: "Owner",
    aliases: ["sleft", "sleave"],
    description: "",
    args: false,
    usage: "<string>",
    permission: [],
    owner: true,
    execute: async (message, args, client, prefix) => {
        let id = args[0];
        if (!id) {
            return message.reply(`You didn't provided the server Id.`)
        }
        let guild = await client.guilds.fetch(id);

        if (!guild) {
            return message.reply(`You didn't provided a valid server Id.`)
        }
        await guild.leave();
        let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription(`**Successfully left Id:** \`${id}\``)
        message.reply({ embeds: [embed] })
    }
}
