const { MessageActionRow, MessageButton, EmbedBuilder, WebhookClient } = require("discord.js");
const web1 = new WebhookClient({ url: `https://discord.com/api/webhooks/1365060395856826399/jUNebsF14XmQET-QebFpHTdoPs4Ac2YU07zg1QDFMr5AS6pxz8_f_ks9oHglrNWcNeaw` });
const { KazagumoPlayer } = require("kazagumo")

module.exports = {
    name: "playerCreate",

    /**
	 * 
	 * @param {Client} client 
	 * @param {KazagumoPlayer} player 
	 */

    run: async (client, player) => {
        
        let name = client.guilds.cache.get(player.guildId).name;

        const embed2 = new EmbedBuilder()
    .setColor(client.ankushcolor)
    .setAuthor({name: `Player Started` , iconURL: client.user.displayAvatarURL()})
    .setDescription(`**Server Name:** ${name}\n**Server Id:** ${player.guildId}`)
     .setTimestamp()
    web1.send({embeds: [embed2]})

        client.logger.log(`Player Create in ${name} [ ${player.guildId} ]`, "log");


    }
};