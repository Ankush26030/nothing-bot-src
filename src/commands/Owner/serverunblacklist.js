const { EmbedBuilder } = require('discord.js');
const blacklistedServerService = require('../../services/blacklistedServerService');

module.exports = {
    name: "serverunblacklist",
    aliases: ["subl"],
    category: "Owner",
    description: "Removes a server from the blacklist.",
    args: true,
    usage: "<serverID>",
    owner: false,
    execute: async (message, args, client, prefix) => {
        // Same authorized users as the blacklist
        const authorizedUsers = ["829008198232178699", "239496212699545601"];
        if (!authorizedUsers.includes(message.author.id)) {
            return message.reply("You don't have permission to use this command.");
        }
        
        const serverId = args[0];
        if (!serverId) {
            return message.reply("Please provide a valid server ID to unblacklist.");
        }
        
        try {
            // Check if server is blacklisted
            const isBlacklisted = await blacklistedServerService.isBlacklisted(serverId);
            if (!isBlacklisted) {
                return message.reply(`Server ID ${serverId} is not blacklisted.`);
            }
            
            // Remove server from blacklist
            const success = await blacklistedServerService.removeFromBlacklist(serverId);
            if (!success) {
                return message.reply("An error occurred while removing the server from the blacklist.");
            }
            
            // Create and send embed
            const unblacklistEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("Server Unblacklisted")
                .setDescription(`Server ID ${serverId} has been removed from the blacklist.`)
                .addFields(
                    { name: "Server ID", value: serverId, inline: true }
                )
                .setFooter({ text: `Unblacklisted by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            
            message.reply({ embeds: [unblacklistEmbed] });
        } catch (error) {
            console.error("Error in serverunblacklist command:", error);
            message.reply("An error occurred while processing the command.");
        }
    }
};