const { EmbedBuilder } = require('discord.js');
const { convertTime } = require("../../utils/convert");
const ms = require('ms');

module.exports = {
    name: 'forward',
    category: 'Music',
    aliases: ["seek"],
    description: 'Forward/seeks the player to the provided timestamp.',
    args: false,
    usage: '<time>',
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

        // Check if time argument is provided
        if (!args[0]) {
            let embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`Please provide a valid time to seek to!\nExample: \`${prefix}forward 2m\` or \`${prefix}forward 10s\``)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        try {
            const time = ms(args[0]); // Parse just the first argument
            if (!time || isNaN(time)) {
                let embed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setAuthor({
                        name: message.author.username,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription(`Please provide a valid time format!\nExample: \`2m\`, \`10s\`, \`1h\``)
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }

            const duration = player.queue.current.length;
            const song = player.queue.current;
            const title = song.title.length > 20
                ? song.title.slice(0, 20) + "..."
                : song.title;

            if (time <= duration) {
                await player.shoukaku.seekTo(time);
                
                let embed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setAuthor({
                        name: message.author.username,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription(`⏭️ Forwarded to: \`${convertTime(time)}\`\nSong: **${title}**`)
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            } else {
                let embed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setAuthor({
                        name: message.author.username,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription(`Cannot forward beyond song duration: \`${convertTime(duration)}\``)
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }
        } catch (error) {
            let embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`An error occurred while trying to forward the track. Please try again with a valid time format.`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }
    },
};