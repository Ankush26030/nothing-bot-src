const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const BlacklistModel = require('../../models/blacklist');

// Array of authorized user IDs who can use blacklist commands
const AUTHORIZED_USERS = [
    "239496212699545601", "622786214776406017"
    // Add more authorized user IDs here
];

// Special array for users who can use the reset command
const RESET_AUTHORIZED_USERS = [
    "239496212699545601" 
    // Add more reset-authorized user IDs here
];

// Helper function to get user from mention or ID
async function resolveUser(message, arg, client) {
    if (!arg) return null;
    
    // Try to get user from mention
    const mentionedUser = message.mentions.members?.first();
    if (mentionedUser) return mentionedUser;
    
    // Try to get user from ID using guild cache if available
    if (message.guild) {
        try {
            const userFromGuild = message.guild.members.cache.get(arg);
            if (userFromGuild) return userFromGuild;
            
            // Try to fetch from guild if not in cache
            try {
                const fetchedMember = await message.guild.members.fetch(arg);
                if (fetchedMember) return fetchedMember;
            } catch (fetchError) {
                // User might not be in this guild, continue to try client.users
            }
        } catch (error) {
            // Continue to try client.users if guild methods fail
        }
    }
    
    // Try to get user directly from client if not found in guild
    try {
        const user = await client.users.fetch(arg);
        if (user) {
            // Return a partial member-like object with necessary properties
            return {
                id: user.id,
                user: user
            };
        }
    } catch (error) {
        // User ID not valid or not found
    }
    
    return null;
}

// Create embed for blacklist operations
function createEmbed(client, username, action) {
    return new EmbedBuilder()
        .setColor(0x00ff00)
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`${username} has been ${action} the blacklist.`)
        .setTimestamp();
}

// Create help embed
function createHelpEmbed(client, message) {
    return new EmbedBuilder()
        .setColor(0x00ff00)
        .setAuthor({ 
            name: client.user.username, 
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle('Blacklist Command Help')
        .setDescription([
            '`blacklist add <@user|userID>` - Add a user to blacklist',
            '`blacklist remove <@user|userID>` - Remove a user from blacklist',
            '`blacklist show` - Display all blacklisted users',
            '`blacklist reset` - Clear the entire blacklist (restricted permission)'
        ].join('\n'))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
}

// Create pagination dropdown
function createPaginationDropdown(totalPages) {
    const options = [];
    
    // Add page options
    for (let i = 0; i < totalPages; i++) {
        options.push({
            label: `Page ${i + 1}`,
            description: `Go to page ${i + 1}`,
            value: `page_${i}`,
        });
    }
    
    // Add close option
    options.push({
        label: 'Close',
        description: 'Close this menu',
        value: 'close',
    });
    
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('pagination')
            .setPlaceholder('Select a page')
            .addOptions(options)
    );
}

module.exports = {
    name: 'blacklist',
    category: 'Dev',
    aliases: ['bl'],
    description: 'Manage blacklisted users',
    usage: '<add/remove/show/reset> [@user|userID]',
    userPerms: [],
    botPerms: ['EmbedLinks'],
    owner: false,
    // Add DM support flag
    guildOnly: false,

    execute: async (message, args, client) => {
        // Check if user is authorized
        if (!AUTHORIZED_USERS.includes(message.author.id)) {
            return message.reply("You don't have permission to use this command.");
        }

        const subcommand = args[0]?.toLowerCase();

        // Show help if no subcommand
        if (!subcommand) {
            return message.channel.send({ embeds: [createHelpEmbed(client, message)] });
        }

        try {
            switch (subcommand) {
                case 'add': {
                    const targetUser = await resolveUser(message, args[1], client);
                    if (!targetUser) {
                        return message.reply('Please mention a user or provide a valid user ID.');
                    }

                    const [blacklist, created] = await BlacklistModel.findOrCreate({
                        where: { userId: targetUser.id }
                    });

                    return message.reply({
                        embeds: [createEmbed(
                            client,
                            targetUser.user.username,
                            created ? 'added to' : 'already in'
                        )]
                    });
                }

                case 'remove': {
                    const targetUser = await resolveUser(message, args[1], client);
                    if (!targetUser) {
                        return message.reply('Please mention a user or provide a valid user ID.');
                    }

                    const deleted = await BlacklistModel.destroy({
                        where: { userId: targetUser.id }
                    });

                    return message.reply({
                        embeds: [createEmbed(
                            client,
                            targetUser.user.username,
                            deleted ? 'removed from' : 'not found in'
                        )]
                    });
                }

                case 'show': {
                    const blacklistedUsers = await BlacklistModel.findAll();
                    if (!blacklistedUsers.length) {
                        return message.reply('No users are currently blacklisted.');
                    }

                    let currentPage = 0;
                    const itemsPerPage = 10;
                    const totalPages = Math.ceil(blacklistedUsers.length / itemsPerPage);

                    const generatePageEmbed = async (page) => {
                        const start = page * itemsPerPage;
                        const end = Math.min(start + itemsPerPage, blacklistedUsers.length);
                        const users = blacklistedUsers.slice(start, end);

                        const userList = await Promise.all(users.map(async (entry, index) => {
                            try {
                                const user = await client.users.fetch(entry.userId);
                                return `\`${start + index + 1}.\` ${user.tag || user.username} (ID: ${user.id})`;
                            } catch {
                                return `\`${start + index + 1}.\` Unknown User (ID: ${entry.userId})`;
                            }
                        }));

                        return new EmbedBuilder()
                            .setColor("#ff0000")
                            .setTitle(`Blacklisted Users (Page ${page + 1}/${totalPages})`)
                            .setDescription(userList.join('\n'))
                            .setTimestamp();
                    };

                    const embed = await generatePageEmbed(currentPage);
                    const dropdown = createPaginationDropdown(totalPages);
                    
                    const msg = await message.channel.send({
                        embeds: [embed],
                        components: [dropdown]
                    });

                    const collector = msg.createMessageComponentCollector({
                        filter: (i) => i.user.id === message.author.id,
                        time: 300000
                    });

                    collector.on('collect', async (interaction) => {
                        const selectedValue = interaction.values[0];
                        
                        if (selectedValue === 'close') {
                            await msg.delete().catch(() => {});
                            return;
                        }
                        
                        // Extract page number from the selected value
                        currentPage = parseInt(selectedValue.split('_')[1]);
                        
                        const newEmbed = await generatePageEmbed(currentPage);
                        await interaction.update({
                            embeds: [newEmbed],
                            components: [dropdown]
                        }).catch(() => {});
                    });

                    collector.on('end', () => {
                        const disabledDropdown = createPaginationDropdown(totalPages);
                        // Disable the select menu
                        disabledDropdown.components[0].setDisabled(true);
                        msg.edit({ components: [disabledDropdown] }).catch(() => {});
                    });
                    break;
                }

                case 'reset': {
                    // Special permission check for reset command
                    if (!RESET_AUTHORIZED_USERS.includes(message.author.id)) {
                        return message.reply("You don't have permission to reset the blacklist.");
                    }

                    const count = await BlacklistModel.count();
                    if (count === 0) {
                        return message.reply('The blacklist is already empty.');
                    }

                    await BlacklistModel.destroy({ where: {} });
                    return message.reply(`Successfully cleared the blacklist (removed ${count} users).`);
                }

                default:
                    return message.channel.send({ embeds: [createHelpEmbed(client, message)] });
            }
        } catch (error) {
            console.error('Blacklist command error:', error);
            return message.reply('An error occurred while processing the command.');
        }
    }
};