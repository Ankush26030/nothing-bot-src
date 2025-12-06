const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'darthvader',
    category: 'Filters',
    cooldown: 5,
    description: 'Toggle Darth Vader voice filter for the current song',
    args: false,
    usage: '',
    userPrams: [],
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
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

        if (player.darth) {
            player.setDarth(false);
            embed.setDescription('🎭 Darth Vader Filter has been: `Disabled`');
        } else {
            player.setDarth(true);
            embed.setDescription('🎭 Darth Vader Filter has been: `Enabled`');
        }

        return message.reply({ embeds: [embed] });
    }
};