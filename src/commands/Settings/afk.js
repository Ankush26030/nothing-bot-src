const { EmbedBuilder } = require('discord.js');
const AFK = require('../../models/afk');
const moment = require('moment');
const { hasVotePermission } = require('../../utils/voteCheck');

module.exports = {
    name: 'afk',
    aliases: ['away'],
    description: 'Set your AFK status with an optional reason',
    args: false,
    usage: '[reason]',
    cooldown: 10,
    category: 'Settings',
    execute: async (message, args, client) => {
        // Check if user has voted
        const hasVoted = await hasVotePermission(message.author.id, client);
        if (!hasVoted) {
            return message.reply("This command requires you to vote for the bot! Use the `vote` command to learn more.");
        }

        // Get the reason from arguments or use default
        const reason = args.length ? args.join(' ') : 'AFK';

        try {
            // Check if user is already AFK
            const existingAfk = await AFK.findOne({ where: { userId: message.author.id } });

            if (existingAfk) {
                // Update existing AFK record
                await existingAfk.update({
                    reason,
                    timestamp: new Date(),
                    mentionCount: 0
                });

                const updateEmbed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setAuthor({ 
                        name: `${message.author.username}'s AFK Updated`, 
                        iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                    })
                    .setDescription(`Your AFK status has been updated.`)
                    .addFields([{ name: 'Reason', value: reason }])
                    .setFooter({ text: 'You will be marked as AFK in all servers. When you send a message, your AFK status will be removed.' })
                    .setTimestamp();

                return message.reply({ embeds: [updateEmbed] });
            } else {
                // Create new AFK record
                await AFK.create({
                    userId: message.author.id,
                    guildId: message.guild.id,
                    reason,
                    timestamp: new Date(),
                    mentionCount: 0
                });



                const afkEmbed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setAuthor({ 
                        name: `${message.author.username} is now AFK`, 
                        iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                    })
                    .setDescription(`You have been marked as AFK.`)
                    .addFields([{ name: 'Reason', value: reason }])
                    .setFooter({ text: 'You will be marked as AFK in all servers. When you send a message, your AFK status will be removed.' })
                    .setTimestamp();

                return message.reply({ embeds: [afkEmbed] });
            }
        } catch (error) {
            console.error('Error setting AFK status:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('There was an error setting your AFK status. Please try again later.')
                .setTimestamp();
                
            return message.reply({ embeds: [errorEmbed] });
        }
    }
};