const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "dm",
    category: "Dev",
    description: "Sends a direct message to a specified user and deletes the command message",
    args: true,
    usage: "<user_mention/user_id> <message>",
    userPerms: [],
    owner: false,
    execute: async (message, args, client) => {
        const ownerIds = ["239496212699545601", "622786214776406017"]; // Add valid owner IDs here
        if (!ownerIds.includes(message.author.id)) return;

        // Check if there's a mention or ID
        let userId = args[0];
        
        // Handle mention format
        if (message.mentions.users.size > 0) {
            userId = message.mentions.users.first().id;
        } else {
            // Clean up the ID if it's a mention format but not properly parsed
            userId = userId.replace(/[<@!>]/g, '');
        }

        const dmMessage = args.slice(1).join(" ");

        if (!userId || !dmMessage) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("Please provide a valid user mention or ID and message.");
            return message.reply({ embeds: [errorEmbed] });
        }

        const targetUser = await client.users.fetch(userId).catch(() => null);
        
        if (!targetUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("Could not find a user with that mention/ID.");
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Send DM to the target user
            await targetUser.send(dmMessage);
            
            // Create success embed
            const successEmbed = new EmbedBuilder()
                .setColor("#00ff00")
                .setDescription(`Successfully sent a DM to ${targetUser.tag}`);
            
            // Reply with success message
            await message.reply({ embeds: [successEmbed] });
            
            // Delete the original command message
            if (message.channel.type !== 'DM') {
                try {
                    await message.delete();
                } catch (deleteError) {
                    console.error("Failed to delete message:", deleteError);
                    // Send a follow-up message if deletion fails
                    message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("#ff9900")
                                .setDescription("Note: I couldn't delete your message. Make sure the bot has the 'Manage Messages' permission.")
                        ]
                    }).then(msg => {
                        // Delete the warning after 5 seconds
                        setTimeout(() => msg.delete().catch(() => {}), 5000);
                    });
                }
            }
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor("#ff0000")
                .setDescription("Failed to send the DM. The user might have DMs disabled or has blocked the bot.");
            message.reply({ embeds: [errorEmbed] });
        }
    },
};