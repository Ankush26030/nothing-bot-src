const { EmbedBuilder } = require('discord.js');
const Maintenance = require('../../models/maintenance');

module.exports = {
    name: 'maintenance',
    category: 'Dev',
    aliases: ["mt"],
    description: 'Toggle maintenance mode for the bot.',
    usage: '[on/off] [reason]',
    args: true,
    async execute(message, args, client) {
        // Array of authorized user IDs
        const allowedUsers = [
            '239496212699545601', // Replace with actual user ID
            '622786214776406017'  // Add more IDs as needed
        ];

        // Check if the user is authorized
        if (!allowedUsers.includes(message.author.id)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Unauthorized')
                .setDescription('You do not have permission to use this command.')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        const action = args[0].toLowerCase();
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (action !== 'on' && action !== 'off') {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Invalid Action')
                .setDescription('Please specify `on` or `off` to toggle maintenance mode.')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        let maintenance = await Maintenance.findOne();
        if (!maintenance) {
            maintenance = await Maintenance.create({
                isActive: false,
                reason: null,
                updatedBy: null
            });
        }

        if (action === 'on') {
            if (maintenance.isActive) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Maintenance Already Active')
                    .setDescription('The bot is already in maintenance mode.')
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }

            await maintenance.update({
                isActive: true,
                reason: reason,
                updatedBy: message.author.id
            });

            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('Maintenance Mode Enabled')
                .setDescription(`Maintenance mode has been enabled.\n**Reason:** ${reason}`)
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        } else {
            if (!maintenance.isActive) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Maintenance Not Active')
                    .setDescription('The bot is not in maintenance mode.')
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }

            await maintenance.update({
                isActive: false,
                reason: null,
                updatedBy: message.author.id
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Maintenance Mode Disabled')
                .setDescription('Maintenance mode has been disabled.')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }
    }
};