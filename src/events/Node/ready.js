const AutoReconnect = require('../../models/autoreconnect');

module.exports = {
    name: "ready",
    run: async (client, name) => {
        try {
            client.logger.log(`Lavalink "${name}" connected.`, "ready");
            client.logger.log("Auto Reconnect Collecting player 24/7 data", "log");

            const maindata = await AutoReconnect.findAll();
            client.logger.log(`Auto Reconnect found ${maindata.length ? `${maindata.length} queue${maindata.length > 1 ? 's' : ''}. Resuming all auto reconnect queue` : '0 queue'}`, "ready");

            for (let data of maindata) {
                const index = maindata.indexOf(data);
                setTimeout(async () => {
                    const channel = client.channels.cache.get(data.TextId);
                    const voice = client.channels.cache.get(data.VoiceId);
                    if (!channel || !voice) return await data.destroy(); // Use destroy instead of delete for Sequelize
                    await client.manager.createPlayer({
                        guildId: data.Guild,
                        voiceId: data.VoiceId,
                        textId: data.TextId,
                        deaf: true,
                    });
                }, index * 5000);
            }
        } catch (error) {
            console.error('Error handling ready event:', error);
        }
    }
};
