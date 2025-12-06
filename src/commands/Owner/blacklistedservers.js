const { EmbedBuilder } = require('discord.js');
const blacklistedServerService = require('../../services/blacklistedServerService');

module.exports = {
    name: "blacklistedservers",
    aliases: ["bls"],
    category: "Owner",
    description: "Shows all blacklisted servers.",
    args: false,
    usage: "",
    owner: false,
    execute: async (message, args, client, prefix) => {
        // Same authorized users as the blacklist
        const authorizedUsers = ["829008198232178699", "239496212699545601"];
        if (!authorizedUsers.includes(message.author.id)) {
            return message.reply("You don't have permission to use this command.");
        }
        
        try {
            // Get all blacklisted servers
            const blacklistedServers = await blacklistedServerService.getAllBlacklistedServers();
            
            if (blacklistedServers.length === 0) {
                return message.reply("There are no blacklisted servers.");
            }
            
            // Create embed
            const embed = new EmbedBuilder()
                .setColor(client.embedColor)
                .setTitle("Blacklisted Servers")
                .setDescription(`Total blacklisted servers: ${blacklistedServers.length}`)
                .setTimestamp();
            
            // Add fields for each blacklisted server (no limit)
            for (const server of blacklistedServers) {
                const blacklistedAt = new Date(server.blacklisted_at).toLocaleString();
                
                embed.addFields({
                    name: `Server ID: ${server.server_id}`,
                    value: `Blacklisted by: <@${server.blacklisted_by}>\nBlacklisted at: ${blacklistedAt}`,
                    inline: false
                });
            }
            
            message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in blacklistedservers command:", error);
            message.reply("An error occurred while fetching the blacklisted servers.");
        }
    }
};