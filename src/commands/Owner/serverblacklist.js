const { EmbedBuilder } = require('discord.js');
const blacklistedServerService = require('../../services/blacklistedServerService');
module.exports = {
    name: "serverblacklist",
    aliases: ["sbl"],
    category: "Owner",
    description: "Blacklists a server from using the bot.",
    args: true,
    usage: "<serverID>",
    owner: false,
    execute: async (message, args, client, prefix) => {
        // Same authorized users as the user blacklist
        const authorizedUsers = ["829008198232178699", "239496212699545601"];
        if (!authorizedUsers.includes(message.author.id)) {
            return message.reply("You don't have permission to use this command.");
        }
        
        const serverId = args[0];
        if (!serverId) {
            return message.reply("Please provide a valid server ID to blacklist.");
        }
        
        try {
            // Check if the server exists
            const guild = await client.guilds.fetch(serverId).catch(() => null);
            if (!guild) {
                return message.reply("I couldn't find a server with that ID or I'm not in that server.");
            }
            
            // Check if server is already blacklisted
            const isBlacklisted = await blacklistedServerService.isBlacklisted(serverId);
            if (isBlacklisted) {
                return message.reply(`Server "${guild.name}" is already blacklisted from using the bot.`);
            }
            
            // Add server to blacklist
            const success = await blacklistedServerService.addToBlacklist(serverId, message.author.id);
            if (!success) {
                return message.reply("An error occurred while adding the server to the blacklist.");
            }
            
            // Create and send embed
            const blacklistEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle("Server Blacklisted")
                .setDescription(`Server "${guild.name}" (${serverId}) has been blacklisted from using the bot.`)
                .addFields(
                    { name: "Server Name", value: guild.name, inline: true },
                    { name: "Server ID", value: serverId, inline: true }
                )
                .setFooter({ text: `Blacklisted by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            
            message.reply({ embeds: [blacklistEmbed] });
            
            // Leave the server if bot is in it
            if (guild) {
                await guild.leave();
            }
        } catch (error) {
            console.error("Error in serverblacklist command:", error);
            message.reply("An error occurred while processing the command.");
        }
    }
};