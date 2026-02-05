// ===== UPDATED VOTE SYSTEM =====
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");

// Import the VoteBypass model from your database configuration
const { VoteBypass } = require('../database/index'); // Adjust this path to match your database file location

// Hardcoded API token
const API_TOKEN = "";

/**
 * Checks if a user has a vote bypass
 * @param {string} userId - Discord user ID to check
 * @param {string} guildId - Guild ID (optional, for guild-specific bypasses)
 * @returns {Promise<Object>} - Object containing bypass status and data
 */
async function checkVoteBypass(userId, guildId = null) {
    try {
        // Check for global bypass first
        let bypass = await VoteBypass.findOne({
            where: {
                userId: userId,
                guildId: null
            }
        });

        // If no global bypass and guildId provided, check for guild-specific bypass
        if (!bypass && guildId) {
            bypass = await VoteBypass.findOne({
                where: {
                    userId: userId,
                    guildId: guildId
                }
            });
        }

        if (!bypass) {
            return { hasBypass: false };
        }

        // Check if bypass has expired
        if (!bypass.permanent && bypass.expiresAt && new Date() > bypass.expiresAt) {
            await bypass.destroy();
            return { hasBypass: false, expired: true };
        }

        return {
            hasBypass: true,
            bypassData: bypass,
            isGlobal: bypass.guildId === null,
            isPermanent: bypass.permanent
        };
    } catch (error) {
        console.error('Error checking vote bypass:', error);
        return { hasBypass: false, error: error.message };
    }
}

/**
 * Adds a vote bypass for a user
 * @param {string} userId - User ID to add bypass for
 * @param {string} addedBy - User ID who added the bypass
 * @param {Object} options - Bypass options
 * @returns {Promise<Object>} - Result of the operation
 */
async function addVoteBypass(userId, addedBy, options = {}) {
    try {
        const {
            guildId = null,
            reason = null,
            permanent = true,
            expiresAt = null
        } = options;

        // Check if bypass already exists
        const existingBypass = await VoteBypass.findOne({
            where: {
                userId: userId,
                guildId: guildId
            }
        });

        if (existingBypass) {
            return {
                success: false,
                error: 'Vote bypass already exists for this user'
            };
        }

        const bypass = await VoteBypass.create({
            userId,
            guildId,
            addedBy,
            reason,
            permanent,
            expiresAt
        });

        return {
            success: true,
            bypass: bypass
        };
    } catch (error) {
        console.error('Error adding vote bypass:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Removes a vote bypass for a user
 * @param {string} userId - User ID to remove bypass for
 * @param {string} guildId - Guild ID (optional)
 * @returns {Promise<Object>} - Result of the operation
 */
async function removeVoteBypass(userId, guildId = null) {
    try {
        const result = await VoteBypass.destroy({
            where: {
                userId: userId,
                guildId: guildId
            }
        });

        return {
            success: result > 0,
            removed: result > 0
        };
    } catch (error) {
        console.error('Error removing vote bypass:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Lists all vote bypasses for a guild or globally
 * @param {string} guildId - Guild ID (null for global bypasses)
 * @returns {Promise<Array>} - Array of bypasses
 */
async function listVoteBypasses(guildId = null) {
    try {
        const bypasses = await VoteBypass.findAll({
            where: guildId !== undefined ? { guildId } : {},
            order: [['createdAt', 'DESC']]
        });

        return bypasses;
    } catch (error) {
        console.error('Error listing vote bypasses:', error);
        return [];
    }
}

/**
 * Checks if a user has voted for the bot on Discord Bot List
 * @param {string} userId - Discord user ID to check
 * @param {Object} client - Discord client object
 * @returns {Promise<Object>} - Object containing vote status and data
 */
async function checkVoteStatus(userId, client) {
    try {
        const response = await axios.get(`https://discordbotlist.com/api/v1/bots/${client.user.id}/upvotes`, {
            headers: {
                'Authorization': `Bot ${API_TOKEN}`
            }
        });

        const hasVoted = response.data.upvotes.some(vote => vote.user_id === userId);
        const userVote = response.data.upvotes.find(vote => vote.user_id === userId);

        return {
            success: true,
            hasVoted,
            voteData: userVote,
            allVotes: response.data.upvotes
        };
    } catch (error) {
        console.error('Error checking vote status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Creates a vote embed based on user's vote status
 * @param {boolean} hasVoted - Whether the user has voted
 * @param {Object} client - Discord client object
 * @param {Object} user - Discord user object
 * @param {Object} voteData - Vote data if available
 * @param {Object} bypassData - Bypass data if available
 * @returns {EmbedBuilder} - Discord embed for vote status
 */
function createVoteEmbed(hasVoted, client, user, voteData = null, bypassData = null) {
    let color = '#FF0000'; // Red for no vote
    let title = 'Vote Status';
    let description = '';

    if (bypassData && bypassData.hasBypass) {
        color = '#FFD700'; // Gold for bypass
        title = 'Vote Bypass Active';
        description = `🔓 You have a vote bypass for ${client.user.username}!\n${bypassData.isGlobal ? '🌍 Global bypass' : '🏠 Server-specific bypass'}`;
    } else if (hasVoted) {
        color = '#00FF00'; // Green for voted
        description = `✅ Thank you for voting for ${client.user.username}!`;
    } else {
        description = `❌ You haven't voted for ${client.user.username} yet!`;
    }

    const voteEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: `Requested by ${user.tag}` })
        .setTimestamp();

    // Add bypass info if available
    if (bypassData && bypassData.hasBypass) {
        const fields = [];
        
        if (bypassData.bypassData.reason) {
            fields.push({ name: 'Reason', value: bypassData.bypassData.reason, inline: true });
        }
        
        fields.push({ 
            name: 'Type', 
            value: bypassData.isPermanent ? 'Permanent' : 'Temporary', 
            inline: true 
        });
        
        if (!bypassData.isPermanent && bypassData.bypassData.expiresAt) {
            fields.push({ 
                name: 'Expires', 
                value: `<t:${Math.floor(new Date(bypassData.bypassData.expiresAt).getTime() / 1000)}:R>`, 
                inline: true 
            });
        }
        
        voteEmbed.addFields(fields);
    }
    // Add cooldown info if they've voted
    else if (hasVoted && voteData && voteData.timestamp) {
        const voteTime = new Date(voteData.timestamp);
        const nextVoteTime = new Date(voteTime.getTime() + 12 * 60 * 60 * 1000); // 12 hours cooldown

        voteEmbed.addFields(
            { name: 'Last Vote', value: `<t:${Math.floor(voteTime.getTime() / 1000)}:R>`, inline: true },
            { name: 'Next Vote', value: `<t:${Math.floor(nextVoteTime.getTime() / 1000)}:R>`, inline: true }
        );
    } else if (!hasVoted) {
        voteEmbed.addFields(
            { name: 'Vote Benefits', value: 'Voting gives you access to exclusive commands and features!' }
        );
    }

    return voteEmbed;
}

/**
 * Creates a vote button for Discord Bot List
 * @param {string} botId - The Discord bot ID
 * @returns {ActionRowBuilder} - Row with vote button
 */
function createVoteButton(botId) {
    const voteButton = new ButtonBuilder()
        .setLabel('Vote for Bot')
        .setURL(`https://discordbotlist.com/bots/${botId}/upvote`)
        .setStyle(ButtonStyle.Link);

    return new ActionRowBuilder().addComponents(voteButton);
}

/**
 * Handles the complete vote check process for a Discord message
 * @param {Object} message - Discord message object
 * @param {Object} client - Discord client object
 * @returns {Promise<Object>} - Object containing result information
 */
async function handleVoteCheck(message, client) {
    try {
        // Initial response
        const sent = await message.reply({ content: "Checking your vote status..." });

        // Check for vote bypass first
        const bypassStatus = await checkVoteBypass(message.author.id, message.guild?.id);
        
        // Check vote status
        const voteStatus = await checkVoteStatus(message.author.id, client);

        if (!voteStatus.success && !bypassStatus.hasBypass) {
            await sent.edit({ content: 'Failed to check your vote status. Please try again later.' });
            return { success: false, error: voteStatus.error };
        }

        // Create embed and button
        const voteEmbed = createVoteEmbed(
            voteStatus.hasVoted || false,
            client,
            message.author,
            voteStatus.voteData,
            bypassStatus
        );
        
        const components = [];
        if (!bypassStatus.hasBypass) {
            components.push(createVoteButton(client.user.id));
        }

        // Edit the initial message with the embed and button
        await sent.edit({
            content: null,
            embeds: [voteEmbed],
            components: components
        });

        return {
            success: true,
            hasVoted: voteStatus.hasVoted || false,
            hasBypass: bypassStatus.hasBypass || false,
            message: sent
        };
    } catch (error) {
        console.error('Error in vote check handler:', error);
        message.reply({ content: 'Failed to check your vote status. Please try again later.' });
        return { success: false, error: error.message };
    }
}

/**
 * Checks if a user has permission to use vote-restricted commands
 * @param {string} userId - Discord user ID to check
 * @param {Object} client - Discord client object
 * @param {string} guildId - Guild ID (optional)
 * @returns {Promise<boolean>} - Whether the user has permission
 */
async function hasVotePermission(userId, client, guildId = null) {
    // Check for vote bypass first
    const bypassStatus = await checkVoteBypass(userId, guildId);
    if (bypassStatus.hasBypass) {
        return true;
    }

    // Check actual vote status
    const voteStatus = await checkVoteStatus(userId, client);
    return voteStatus.success && voteStatus.hasVoted;
}

module.exports = {
    // Original functions
    checkVoteStatus,
    createVoteEmbed,
    createVoteButton,
    handleVoteCheck,
    hasVotePermission,
    
    // New bypass functions
    checkVoteBypass,
    addVoteBypass,
    removeVoteBypass,
    listVoteBypasses
};
