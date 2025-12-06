const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'loop',
    category: 'Music',
    aliases: ['repeat'],
    description: 'Toggle music loop',
    args: false,
    usage: 'loop <track|queue|off>',
    userPrams: [],
    cooldown: 5,
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = client.manager.players.get(message.guild.id);

        if (!player.queue.current) {
            let embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username || "Unknown User",
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`No song/s currently playing within this guild.`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        if (!args[0]) {
            let embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`Please specify a loop mode!\nAvailable modes: \`track\`, \`queue\`, \`off\``)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        let embed = new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        if (['q', 'queue', 'all'].includes(args[0])) {
            await player.setLoop('queue');
            embed.setDescription(`🔄 Loop mode set to: **Queue**`);
        } else if (['track', 't', 'song', 'current'].includes(args[0])) {
            await player.setLoop('track');
            embed.setDescription(`🔂 Loop mode set to: **Track**`);
        } else if (['off', 'c', 'clear', 'reset'].includes(args[0])) {
            await player.setLoop('none');
            embed.setDescription(`⭕ Loop mode: **Disabled**`);
        } else {
            embed.setDescription(`Invalid loop mode! Available modes: \`track\`, \`queue\`, \`off\``);
        }

        return message.reply({ embeds: [embed] });
    }
};