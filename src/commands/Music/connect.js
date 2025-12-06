const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: 'connect',
    aliases: ["join", "j"],
    category: 'Music',
    description: 'Join a voice channel',
    args: false,
    usage: '',
    cooldown: 3,
    userPerms: [],
    botPerms: ['Connect', 'Speak', 'EmbedLinks'],
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {
        try {
            const { channel } = message.member.voice;
            
            // Check if user is in a voice channel
            if (!channel) {
                return sendErrorEmbed(message, client, "You need to be in a voice channel to use this command!");
            }

            // Check if bot is already in a voice channel
            if (message.guild.members.me.voice.channel) {
                if (message.guild.members.me.voice.channelId === channel.id) {
                    return sendEmbed(message, client, "I'm already in your voice channel!");
                } else {
                    return sendErrorEmbed(message, client, `I'm already connected to <#${message.guild.members.me.voice.channelId}>!`);
                }
            }

            // Check permissions
            const permissions = channel.permissionsFor(message.guild.members.me);
            if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                return sendErrorEmbed(message, client, "I don't have permission to join or speak in your voice channel!");
            }

            // Check if channel is full
            if (channel.full && !permissions.has(PermissionFlagsBits.MoveMembers)) {
                return sendErrorEmbed(message, client, "Your voice channel is full! I can't join unless I have permission to move members.");
            }
            
            // Check for music manager availability
            if (!client.manager) {
                return sendErrorEmbed(message, client, "Music system is not initialized.");
            }
            
            try {
                // Check for existing player
                const existingPlayer = client.manager.players.get(message.guild.id);
                
                if (existingPlayer) {
                    // If player exists but is not connected to this channel
                    if (existingPlayer.voiceId !== channel.id) {
                        // We need to destroy and recreate it
                        await existingPlayer.destroy();
                        // Wait to ensure cleanup
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        // Player already exists and is in the right channel
                        return sendEmbed(message, client, `Already connected to <#${channel.id}>!`);
                    }
                }
                
                // Create a new player with specific Kazagumo options
                const player = await client.manager.createPlayer({
                    guildId: message.guild.id,
                    voiceId: channel.id,
                    textId: message.channel.id,
                    shardId: message.guild.shardId || 0,
                    deaf: true
                });
                
                // Verify the connection was successful
                if (!player) {
                    return sendErrorEmbed(message, client, "Failed to create player.");
                }
                
                return sendEmbed(message, client, `Successfully joined <#${channel.id}>!`);
            } catch (error) {
                console.error('Kazagumo error:', error);
                
                // Handle specific Kazagumo errors
                if (error.message && error.message.includes("Player is already connected")) {
                    return sendEmbed(message, client, `Already connected to <#${channel.id}>!`);
                }
                
                return sendErrorEmbed(message, client, `Failed to join: ${error.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Error in connect command:', error);
            return sendErrorEmbed(message, client, "An unexpected error occurred. Please try again later.");
        }
    }
};

/**
 * Send an error embed message
 * @param {Message} message Discord message object
 * @param {Client} client Discord client
 * @param {string} description Error description
 * @returns {Promise<Message>}
 */
function sendErrorEmbed(message, client, description) {
    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`❌ ${description}`)
        .setTimestamp();
    
    return message.reply({ embeds: [embed] }).catch(() => {
        return message.channel.send({ embeds: [embed] }).catch(console.error);
    });
}

/**
 * Send a success embed message
 * @param {Message} message Discord message object
 * @param {Client} client Discord client
 * @param {string} description Success description
 * @returns {Promise<Message>}
 */
function sendEmbed(message, client, description) {
    const embed = new EmbedBuilder()
        .setColor(client.config?.embedColor || client.ankushcolor || '#00ff00')
        .setAuthor({
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`🎵 ${description}`)
        .setTimestamp();
    
    return message.reply({ embeds: [embed] }).catch(() => {
        return message.channel.send({ embeds: [embed] }).catch(console.error);
    });
}