const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'disconnect',
    category: 'Music',
    aliases: ["dc", "leave", "quit"],
    description: 'Disconnects the bot from voice channel',
    args: false,
    usage: '',
    userPerms: [],
    cooldown: 3,
    botPerms: ['EmbedLinks'],
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        try {
            // Get the player
            const player = client.manager.players.get(message.guild.id);
            
            // Check if there's a player
            if (!player) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setAuthor({
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setDescription('❌ I\'m not connected to any voice channel!')
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }
            
            // Get the channel name before destroying the player
            const channelName = message.member.voice.channel.name;
            
            // Stop any playback and destroy the player
            player.queue.clear();
            await player.destroy();
            
            // Send success message
            const embed = new EmbedBuilder()
                .setColor(client.ankushcolor || '#ff0000')
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`👋 Successfully disconnected from ${channelName}!`)
                .setTimestamp();
            
            return message.reply({ embeds: [embed] }).catch(e => {
                message.channel.send({ embeds: [embed] }).catch(console.error);
            });
        } catch (error) {
            console.error('Error in disconnect command:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setDescription('❌ An error occurred while disconnecting. Please try again.')
                .setTimestamp();
            
            return message.reply({ embeds: [embed] }).catch(e => {
                message.channel.send({ embeds: [embed] }).catch(console.error);
            });
        }
    }
};