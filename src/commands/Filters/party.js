const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'party',
    category: 'Filters',
    cooldown: 5,
    description: 'Toggle party filter for the current song',
    args: false,
    usage: '',
    userPrams: [],
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        try {
            // Check if client.manager exists
            if (!client.manager) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setDescription('Music system is not properly initialized.')
                    .setTimestamp();
                return message.channel.send({ embeds: [errorEmbed] });
            }

            // Get player with error handling
            const player = client.manager.players.get(message.guild.id);
            
            if (!player) {
                const embed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setAuthor({
                        name: message.author.username || "Unknown User",
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setDescription(`No song/s currently playing within this guild.`)
                    .setTimestamp();
                
                return message.channel.send({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setTimestamp();

            try {
                if (player.party) {
                    await player.setParty(false);
                    embed.setDescription('🎉 Party Filter has been: `Disabled`');
                } else {
                    await player.setParty(true);
                    embed.setDescription('🎉 Party Filter has been: `Enabled`');
                }
                
                return message.reply({ embeds: [embed] });
            } catch (filterError) {
                console.error('Filter Error:', filterError);
                embed.setDescription('❌ Failed to toggle party filter. Please try again.');
                return message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Command Error:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription('An error occurred while executing the command.')
                .setTimestamp();
            return message.channel.send({ embeds: [errorEmbed] });
        }
    }
};