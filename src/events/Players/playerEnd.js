const { MessageEmbed } = require('discord.js');
const { autoplay } = require('../../utils/functions'); // Adjust path to your functions file

module.exports = {
	name: "playerEnd",
	run: async (client, player) => {
		
		if (player.data.get("message") && player.data.get("message").deletable) {
			player.data.get("message").delete().catch(() => null);
		}
		
		let guild = client.guilds.cache.get(player.guildId);
		if (!guild) return;

		// Check if autoplay is enabled
		const autoplayEnabled = player.data.get("autoplay");
		
		if (autoplayEnabled && player.queue.size === 0) {
			try {
				console.log("🎵 Autoplay is enabled, searching for related songs...");
				const result = await autoplay(player, client);
				
				if (!result) {
					console.log("⚠️ Autoplay could not find songs, will retry on next track");
				}
			} catch (error) {
				console.error("❌ Autoplay failed:", error);
				
				// Optional: Send a message to the channel if autoplay fails
				const channel = guild.channels.cache.get(player.textId);
				if (channel) {
					const { EmbedBuilder } = require('discord.js');
					const embed = new EmbedBuilder()
						.setColor("#ff0000")
						.setDescription("❌ Autoplay encountered an error. Trying again...")
						.setTimestamp();
					
					channel.send({ embeds: [embed] }).catch(() => null);
				}
			}
		}
	}
};