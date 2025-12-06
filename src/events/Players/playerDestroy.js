const { EmbedBuilder, WebhookClient, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const db2 = require("../../models/autoreconnect");
const web1 = new WebhookClient({ url: `https://discord.com/api/webhooks/1365060624077557883/GyaHjIIQyb7eqG-iBZj0tEU5AchGee7BqQ6hMRDyaPY4RkIYU93yNxYbUcxqjbAi08ve` });
module.exports = {
    name: "playerDestroy",
    run: async (client, player) => {

        let name = client.guilds.cache.get(player.guildId).name;
        const embed2 = new EmbedBuilder()
    .setColor(client.ankushcolor)
    .setAuthor({name: `Player Destroy` , iconURL: client.user.displayAvatarURL()})
    .setDescription(`**Server Name:** ${name}\n**Server Id:** ${player.guildId}`)
    web1.send({embeds: [embed2]})
    
        client.logger.log(`Player Destroy in ${name} [ ${player.guildId} ]`, "log");

        if (player.data.get('message') && player.data.get('message').deletable ) player.data.get('message').delete().catch(() => null);

        if (player.data.get("autoplay")) try { player.data.delete("autoplay") } catch (err) { client.logger.log(err.stack ? err.stack : err, "log") };

        let guild = client.guilds.cache.get(player.guild);
        if (!guild) return;
        let channel = guild.channels.cache.get(data.Channel);
        if (!channel) return;
    }

};
