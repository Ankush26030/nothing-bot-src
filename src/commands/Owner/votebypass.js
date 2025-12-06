const { EmbedBuilder } = require('discord.js');
const { 
    addVoteBypass, 
    removeVoteBypass, 
    listVoteBypasses, 
    checkVoteBypass 
} = require('../../utils/voteCheck'); // Adjust path as needed

// Authorized user IDs who can use this command
const AUTHORIZED_USERS = [
    '239496212699545601', // Replace with actual user IDs
    '622786214776406017', // Add more user IDs as needed
    // Add more authorized user IDs here
];

module.exports = {
    name: 'votebypass',
    aliases: ['vb', 'bypass', 'vbp'],
    category: 'Owner',
    description: 'Manage global vote bypasses for users (Authorized users only)',
    usage: 'votebypass <add|remove|list|check> [options]',
    permissions: [], // Removed administrator requirement
    
    async execute(message, args) {
        // Check if user is authorized
        if (!AUTHORIZED_USERS.includes(message.author.id)) {
            return await message.reply('❌ You are not authorized to use this command.');
        }

        if (args.length === 0) {
            return await sendHelpEmbed(message);
        }

        const subcommand = args[0].toLowerCase();

        try {
            switch (subcommand) {
                case 'add':
                    await handleAddBypass(message, args.slice(1));
                    break;
                case 'remove':
                    await handleRemoveBypass(message, args.slice(1));
                    break;
                case 'list':
                    await handleListBypasses(message, args.slice(1));
                    break;
                case 'check':
                    await handleCheckBypass(message, args.slice(1));
                    break;
                case 'help':
                    await sendHelpEmbed(message);
                    break;
                default:
                    await message.reply('❌ Invalid subcommand. Use `votebypass help` for usage information.');
            }
        } catch (error) {
            console.error('Error in votebypass command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('An error occurred while processing your request.')
                .addFields({ name: 'Error Details', value: `\`\`\`${error.message}\`\`\`` })
                .setTimestamp();

            await message.reply({
                embeds: [errorEmbed]
            });
        }
    }
};

// Helper function to send help embed
async function sendHelpEmbed(message) {
    const helpEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🔧 Global Vote Bypass Commands Help')
        .setDescription('Manage global vote bypasses for users')
        .addFields(
            {
                name: '📝 Add Bypass',
                value: '```votebypass add <@user|userID> [duration] [reason]```\n' +
                       '**Duration Options:** 1h, 6h, 12h, 1d, 3d, 1w, 1m, permanent (default)\n' +
                       '**Example:** `votebypass add @user 1w VIP member`',
                inline: false
            },
            {
                name: '🗑️ Remove Bypass',
                value: '```votebypass remove <@user|userID>```\n' +
                       '**Example:** `votebypass remove @user`',
                inline: false
            },
            {
                name: '📋 List Bypasses',
                value: '```votebypass list```\n' +
                       '**Example:** `votebypass list`',
                inline: false
            },
            {
                name: '🔍 Check Bypass',
                value: '```votebypass check <@user|userID>```\n' +
                       '**Example:** `votebypass check @user`',
                inline: false
            }
        )
        .setFooter({ text: 'Authorized users only • All bypasses are global' })
        .setTimestamp();

    await message.reply({ embeds: [helpEmbed] });
}

// Helper function to parse user from mention or ID
function parseUser(message, userString) {
    if (!userString) return null;
    
    // Try to get user from mention
    const mentionMatch = userString.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
        return message.client.users.cache.get(mentionMatch[1]);
    }
    
    // Try to get user by ID
    if (/^\d+$/.test(userString)) {
        return message.client.users.cache.get(userString);
    }
    
    return null;
}

// Helper function to parse duration
function parseDuration(duration) {
    if (!duration || duration.toLowerCase() === 'permanent' || duration.toLowerCase() === 'perm') {
        return { permanent: true, expiresAt: null };
    }

    const now = new Date();
    let expiresAt;

    switch (duration.toLowerCase()) {
        case '1h':
        case '1hour':
            expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000);
            break;
        case '6h':
        case '6hours':
            expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
            break;
        case '12h':
        case '12hours':
            expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
            break;
        case '1d':
        case '1day':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
        case '3d':
        case '3days':
            expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            break;
        case '1w':
        case '1week':
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
        case '1m':
        case '1month':
            expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            return { permanent: true, expiresAt: null };
    }

    return { permanent: false, expiresAt };
}

// Handle add bypass subcommand
async function handleAddBypass(message, args) {
    if (args.length < 1) {
        return await message.reply('❌ Usage: `votebypass add <@user|userID> [duration] [reason]`');
    }

    const userString = args[0];
    const duration = args[1] || 'permanent';
    const reason = args.slice(2).join(' ') || 'No reason provided';

    // Parse user
    let user = parseUser(message, userString);
    if (!user) {
        // Try to fetch user by ID if not in cache
        try {
            const fetchedUser = await message.client.users.fetch(userString.replace(/[<@!>]/g, ''));
            if (fetchedUser) {
                user = fetchedUser;
            }
        } catch (error) {
            return await message.reply('❌ Invalid user. Please mention a user or provide a valid user ID.');
        }
    }

    const { permanent, expiresAt } = parseDuration(duration);

    const result = await addVoteBypass(user.id, message.author.id, {
        guildId: null, // Always null for global bypasses
        reason,
        permanent,
        expiresAt
    });

    if (!result.success) {
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Failed to Add Bypass')
            .setDescription(result.error)
            .setTimestamp();

        return await message.reply({ embeds: [errorEmbed] });
    }

    const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Global Vote Bypass Added')
        .setDescription(`Successfully added global vote bypass for ${user.tag}`)
        .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Type', value: 'Global', inline: true },
            { name: 'Duration', value: permanent ? 'Permanent' : `Until <t:${Math.floor(expiresAt.getTime() / 1000)}:f>`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Added By', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

    await message.reply({ embeds: [successEmbed] });
}

// Handle remove bypass subcommand
async function handleRemoveBypass(message, args) {
    if (args.length < 1) {
        return await message.reply('❌ Usage: `votebypass remove <@user|userID>`');
    }

    const userString = args[0];

    // Parse user
    let user = parseUser(message, userString);
    if (!user) {
        // Try to fetch user by ID if not in cache
        try {
            const userId = userString.replace(/[<@!>]/g, '');
            user = await message.client.users.fetch(userId);
        } catch (error) {
            return await message.reply('❌ Invalid user. Please mention a user or provide a valid user ID.');
        }
    }

    const result = await removeVoteBypass(user.id, null); // Always null for global bypasses

    if (!result.success) {
        const errorEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Failed to Remove Bypass')
            .setDescription(result.error || 'No bypass found for this user')
            .setTimestamp();

        return await message.reply({ embeds: [errorEmbed] });
    }

    if (!result.removed) {
        const notFoundEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⚠️ No Bypass Found')
            .setDescription(`No global vote bypass found for ${user.tag}`)
            .setTimestamp();

        return await message.reply({ embeds: [notFoundEmbed] });
    }

    const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Global Vote Bypass Removed')
        .setDescription(`Successfully removed global vote bypass for ${user.tag}`)
        .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Type', value: 'Global', inline: true },
            { name: 'Removed By', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

    await message.reply({ embeds: [successEmbed] });
}

// Handle list bypasses subcommand
async function handleListBypasses(message, args) {
    const bypasses = await listVoteBypasses(null); // Always null for global bypasses only

    if (bypasses.length === 0) {
        const noBypassesEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('📋 No Global Vote Bypasses')
            .setDescription('No global vote bypasses found.')
            .setTimestamp();

        return await message.reply({ embeds: [noBypassesEmbed] });
    }

    // Create paginated embeds if there are many bypasses
    const itemsPerPage = 10;
    const totalPages = Math.ceil(bypasses.length / itemsPerPage);
    const currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBypasses = bypasses.slice(startIndex, endIndex);

    const listEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📋 Global Vote Bypasses')
        .setDescription('Showing all global vote bypasses')
        .setFooter({ text: `Page ${currentPage}/${totalPages} • Total: ${bypasses.length} bypasses` })
        .setTimestamp();

    for (const bypass of currentBypasses) {
        const user = await message.client.users.fetch(bypass.userId).catch(() => null);
        const userName = user ? `${user.tag} (${user.id})` : `Unknown User (${bypass.userId})`;
        
        const duration = bypass.permanent ? 'Permanent' : `Until <t:${Math.floor(new Date(bypass.expiresAt).getTime() / 1000)}:f>`;
        const addedBy = await message.client.users.fetch(bypass.addedBy).catch(() => null);
        const addedByName = addedBy ? addedBy.tag : 'Unknown User';

        listEmbed.addFields({
            name: `${userName}`,
            value: `**Type:** Global\n**Duration:** ${duration}\n**Reason:** ${bypass.reason || 'No reason'}\n**Added by:** ${addedByName}\n**Added:** <t:${Math.floor(new Date(bypass.createdAt).getTime() / 1000)}:R>`,
            inline: false
        });
    }

    await message.reply({ embeds: [listEmbed] });
}

// Handle check bypass subcommand
async function handleCheckBypass(message, args) {
    if (args.length < 1) {
        return await message.reply('❌ Usage: `votebypass check <@user|userID>`');
    }

    const userString = args[0];
    
    // Parse user
    let user = parseUser(message, userString);
    if (!user) {
        // Try to fetch user by ID if not in cache
        try {
            const userId = userString.replace(/[<@!>]/g, '');
            user = await message.client.users.fetch(userId);
        } catch (error) {
            return await message.reply('❌ Invalid user. Please mention a user or provide a valid user ID.');
        }
    }
    
    const bypassStatus = await checkVoteBypass(user.id, message.guild.id);

    const checkEmbed = new EmbedBuilder()
        .setColor(bypassStatus.hasBypass ? '#00FF00' : '#FF0000')
        .setTitle('🔍 Global Vote Bypass Check')
        .setDescription(`Checking global vote bypass status for ${user.tag}`)
        .addFields(
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'Has Global Bypass', value: bypassStatus.hasBypass ? '✅ Yes' : '❌ No', inline: true }
        )
        .setTimestamp();

    if (bypassStatus.hasBypass) {
        const bypass = bypassStatus.bypassData;
        checkEmbed.addFields(
            { name: 'Type', value: 'Global', inline: true },
            { name: 'Duration', value: bypassStatus.isPermanent ? 'Permanent' : `Until <t:${Math.floor(new Date(bypass.expiresAt).getTime() / 1000)}:f>`, inline: true },
            { name: 'Reason', value: bypass.reason || 'No reason provided', inline: false }
        );

        if (bypass.addedBy) {
            const addedBy = await message.client.users.fetch(bypass.addedBy).catch(() => null);
            if (addedBy) {
                checkEmbed.addFields({ name: 'Added By', value: addedBy.tag, inline: true });
            }
        }

        checkEmbed.addFields({ name: 'Added', value: `<t:${Math.floor(new Date(bypass.createdAt).getTime() / 1000)}:R>`, inline: true });
    }

    if (bypassStatus.expired) {
        checkEmbed.addFields({ name: 'Note', value: '⚠️ An expired bypass was found and removed', inline: false });
    }

    await message.reply({ embeds: [checkEmbed] });
}