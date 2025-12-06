const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'forceskip',
    aliases: ['fs'],
    category: 'Music',
    description: 'To force skip the current playing song.',
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
        
        const song = player.queue.current;
        await player.skip();
        
        const title = song.title.length > 20
            ? song.title.slice(0, 20) + "..."
            : song.title;
            
        let embed = new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`⏭️ Force skipped: **${title}**`)
            .setTimestamp();
            
        return message.reply({ embeds: [embed] });
    },
};