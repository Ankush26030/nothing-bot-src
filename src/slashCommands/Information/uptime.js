const { EmbedBuilder, CommandInteraction, Client } = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Shows how long the bot has been running',
    userPrams: [],
    botPrams: ['EMBED_LINKS'],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        await interaction.deferReply({
            ephemeral: false
        });

        // Calculate uptime values
        const days = Math.floor(client.uptime / 86400000);
        const hours = Math.floor(client.uptime / 3600000) % 24;
        const minutes = Math.floor(client.uptime / 60000) % 60;
        const seconds = Math.floor(client.uptime / 1000) % 60;

        // Format uptime string
        const uptimeString = [
            days && `${days} days`,
            hours && `${hours} hours`,
            minutes && `${minutes} minutes`,
            seconds && `${seconds} seconds`
        ].filter(Boolean).join(', ');

        const embed = new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setTitle('Bot Uptime')
            .setDescription(`\`\`\`ini\n[ Uptime ] :: ${uptimeString}\`\`\``)
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    },
};