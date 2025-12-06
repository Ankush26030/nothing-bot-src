const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'clearqueue',
    aliases: ['clearq', 'cq'],
    category: 'Music',
    description: 'Clear Music Queue',
    args: false,
    usage: '',
    userPrams: [],
    cooldown: 5,
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = client.manager.players.get(message.guild.id);
        
        if (!player.queue) {
            let embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username || "Unknown User",
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`No song/s currently playing within this guild.`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }
        
        if (!player.queue[0]) {
            let embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`Queue is already empty!`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }
        
        await player.queue.clear();
        
        let embed = new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Queue has been cleared!`)
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }
};