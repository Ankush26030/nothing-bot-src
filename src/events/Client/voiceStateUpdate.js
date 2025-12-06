const { Client, VoiceState, EmbedBuilder } = require("discord.js");
const { KazagumoPlayer } = require("kazagumo");
const reconnect = require("../../models/autoreconnect");
const delay = require("delay");
const { REST } = require("@discordjs/rest");

/** 
 * @param {Client} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 * @param {KazagumoPlayer} player
 * @returns {Promise<void>}
 */
module.exports = {
    name: "voiceStateUpdate",
    run: async (client, oldState, newState) => {
        let guildId = newState.guild.id;
        const player = client.manager.players.get(guildId);
        const reconnectAuto = reconnect.findOne({ where: { Guild: newState.guild.id } });

        // Return if no player or auto reconnect is enabled
        if (!player) return;
        if (reconnectAuto) return;

        // Check if bot is not in voice channel
        if (!newState.guild.members.cache.get(client.user.id).voice.channelId) {
            if (reconnectAuto) return;
            const text = player?.textId;

            // Destroy the player
            await player.destroy(player.guildId);

            // Create and send disconnect embed
            const disconnectEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Voice Channel Disconnected')
                .setDescription('❌ I have been disconnected from the voice channel.')
                .setFooter({ text: 'The music queue has been cleared.' })
                .setTimestamp();

            // Send embed and delete after 5 seconds
            client.channels.cache.get(text)
                .send({ embeds: [disconnectEmbed] })
                .then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(() => {});
                    }, 5000);
                });
        }
    }
};