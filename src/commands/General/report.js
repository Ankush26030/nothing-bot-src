const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
  name: 'report',
  category: 'General',
  aliases: ['bug', 'issue', 'feedback'],
  cooldown: 60,
  description: 'Report a bug or issue with the bot',
  args: false,
  usage: '[description]',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      // Handle quick report if args provided
      if (args.length > 0) {
        const reportText = args.join(' ');
        if (reportText.length < 10) {
          return message.reply('Please provide more details about the bug (minimum 10 characters).');
        }
        
        await handleQuickReport(message, reportText, client);
        return;
      }
      
      // Show selection menu for report types
      const embed = new EmbedBuilder()
        .setColor(client.config?.embedColor || '#ff0000')
        .setAuthor({
          name: `${client.user.username} Bug Report`,
          iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`
          Help improve ${client.user.username} by reporting any bugs or issues you encounter!
          
          **How to report:**
          • Select an option from the dropdown menu below
          • Fill in details about the issue you encountered
          • Submit the form to send your report
          
          Alternatively, you can quickly report by typing:
          \`${prefix}report [description of the bug]\`
        `)
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('report_selection')
            .setPlaceholder('Select report type')
            .addOptions([
              {
                label: 'Bug Report',
                description: 'Report a bug or issue with the bot',
                value: 'bug_report',
                emoji: '🐛'
              },
              {
                label: 'Feature Request',
                description: 'Suggest a new feature for the bot',
                value: 'feature_request',
                emoji: '✨'
              }
            ])
        );

      const response = await message.reply({
        embeds: [embed],
        components: [row]
      });

      // Set up collector for dropdown interaction
      const collector = response.createMessageComponentCollector({ time: 300000 });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'report_selection' && interaction.user.id === message.author.id) {
          const selectedValue = interaction.values[0];
          let reportType;
          
          switch (selectedValue) {
            case 'bug_report':
              reportType = 'Bug Report';
              break;
            case 'feature_request':
              reportType = 'Feature Request';
              break;
          }
          
          await showReportModal(interaction, client, reportType);
          
        } else if (interaction.user.id !== message.author.id) {
          await interaction.reply({ 
            content: 'This menu is not for you. Please use the `/report` command to submit your own report.',
            ephemeral: true 
          });
        }
      });

      collector.on('end', () => {
        const disabledRow = new ActionRowBuilder()
          .addComponents(
            StringSelectMenuBuilder.from(row.components[0])
              .setDisabled(true)
          );
        
        response.edit({ components: [disabledRow] }).catch(() => {});
      });
      
    } catch (error) {
      console.error('Error in report command:', error);
      await message.reply('An error occurred while processing your report. Please try again later.').catch(() => {});
    }
  }
};

// Function to show the report modal
async function showReportModal(interaction, client, reportType) {
  try {
    const modal = new ModalBuilder()
      .setCustomId('report_modal')
      .setTitle(`${reportType} Form`);

    // Customize modal based on report type
    let descPlaceholder, infoLabel, infoPlaceholder;
    
    switch(reportType) {
      case 'Bug Report':
        descPlaceholder = 'Please describe the bug in detail (what happened, what you expected, etc.)';
        infoLabel = 'Steps to Reproduce';
        infoPlaceholder = 'List the steps to reproduce this bug';
        break;
      case 'Feature Request':
        descPlaceholder = 'Please describe the feature you would like to see added';
        infoLabel = 'Use Case';
        infoPlaceholder = 'Explain how this feature would be useful';
        break;
    }

    // Create form inputs
    const titleInput = new TextInputBuilder()
      .setCustomId('report_title')
      .setLabel('Title')
      .setPlaceholder(`Brief description of the ${reportType.toLowerCase()}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('report_description')
      .setLabel('Description')
      .setPlaceholder(descPlaceholder)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1000)
      .setRequired(true);

    const additionalInfoInput = new TextInputBuilder()
      .setCustomId('additional_info')
      .setLabel(infoLabel)
      .setPlaceholder(infoPlaceholder)
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1000)
      .setRequired(false);

    // Add inputs to modal
    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descriptionInput),
      new ActionRowBuilder().addComponents(additionalInfoInput)
    );

    await interaction.showModal(modal);

    // Handle modal submission
    const filter = (i) => i.customId === 'report_modal';
    interaction.awaitModalSubmit({ filter, time: 600000 })
      .then(async (modalInteraction) => {
        const title = modalInteraction.fields.getTextInputValue('report_title');
        const description = modalInteraction.fields.getTextInputValue('report_description');
        const additionalInfo = modalInteraction.fields.getTextInputValue('additional_info') || 'Not provided';

        const reportId = generateReportId();
        
        // Confirm submission to user
        const confirmEmbed = new EmbedBuilder()
          .setColor(getReportColor(reportType))
          .setAuthor({
            name: `${reportType} Submitted`,
            iconURL: modalInteraction.user.displayAvatarURL({ dynamic: true })
          })
          .setDescription(`Thank you for your ${reportType.toLowerCase()}! Your feedback helps improve the bot.`)
          .addFields([
            { name: 'Report ID', value: `#${reportId}`, inline: false },
            { name: 'Title', value: title, inline: false }
          ])
          .setFooter({
            text: `Submitted by ${modalInteraction.user.tag}`,
            iconURL: modalInteraction.user.displayAvatarURL({ dynamic: true })
          })
          .setTimestamp();

        await modalInteraction.reply({ 
          embeds: [confirmEmbed],
          ephemeral: true
        });

        // Send report to developers
        sendReportToDevs(modalInteraction.user, {
          title,
          description,
          additionalInfo,
          reportType,
          reportId
        }, client);
      })
      .catch(error => console.error('Modal interaction error:', error));
      
  } catch (error) {
    console.error('Error showing report modal:', error);
    await interaction.reply({ 
      content: 'Failed to open the report form. Please try again later.',
      ephemeral: true 
    }).catch(() => {});
  }
}

// Function to handle quick reports
async function handleQuickReport(message, reportText, client) {
  try {
    const reportId = generateReportId();
    
    // Confirm to user
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: `Report Submitted`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setDescription(`Thank you for your report! Your feedback helps improve the bot.`)
      .addFields([
        { name: 'Report ID', value: `#${reportId}`, inline: false }
      ])
      .setFooter({
        text: `Submitted by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Send to developers
    sendReportToDevs(message.author, {
      title: reportText.split('\n')[0] || 'Quick Report',
      description: reportText,
      additionalInfo: 'Not provided',
      reportType: 'Quick Report',
      reportId
    }, client);
    
  } catch (error) {
    console.error('Error processing quick report:', error);
    await message.reply('An error occurred while submitting your report. Please try again later.').catch(() => {});
  }
}

// Function to send report to developers
async function sendReportToDevs(user, reportInfo, client) {
  try {
    const reportEmbed = new EmbedBuilder()
      .setColor(getReportColor(reportInfo.reportType))
      .setTitle(`${reportInfo.reportType} #${reportInfo.reportId}`)
      .setDescription(`A new ${reportInfo.reportType.toLowerCase()} has been submitted.`)
      .addFields([
        { name: 'Title', value: reportInfo.title, inline: false },
        { name: 'Description', value: reportInfo.description, inline: false },
        { name: getFieldName(reportInfo.reportType), value: reportInfo.additionalInfo, inline: false },
        { name: 'Reporter', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
      ])
      .setFooter({
        text: `Report ID: ${reportInfo.reportId}`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      });

    // Try to send to appropriate channel
    const channelId = getChannelId(client, reportInfo.reportType);
    if (channelId) {
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        await channel.send({ embeds: [reportEmbed] });
        return;
      }
    }

    // Fallback to owner DM or console
    if (client.config?.ownerId) {
      try {
        const owner = await client.users.fetch(client.config.ownerId);
        await owner.send({ 
          content: `⚠️ New ${reportInfo.reportType.toLowerCase()} received:`,
          embeds: [reportEmbed] 
        });
      } catch (error) {
        console.log(`${reportInfo.reportType} from ${user.tag} (${user.id}):`, reportInfo);
      }
    } else {
      console.log(`${reportInfo.reportType} from ${user.tag} (${user.id}):`, reportInfo);
    }
  } catch (error) {
    console.error('Error sending report to developers:', error);
  }
}

// Helper functions
function getFieldName(reportType) {
  switch(reportType) {
    case 'Bug Report': return 'Steps to Reproduce';
    case 'Feature Request': return 'Use Case';
    default: return 'Additional Information';
  }
}

function getChannelId(client, reportType) {
  switch(reportType) {
    case 'Bug Report': return client.config?.bugReportChannel;
    case 'Feature Request': return client.config?.featureRequestChannel || client.config?.bugReportChannel;
    default: return client.config?.bugReportChannel;
  }
}

function getReportColor(reportType) {
  switch(reportType) {
    case 'Bug Report': return '#FF0000'; // Red
    case 'Feature Request': return '#7289DA'; // Discord Blurple
    default: return '#FF0000'; // Red
  }
}

// Generate a unique report ID
function generateReportId() {
  const timestamp = Date.now().toString(36).substring(4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${random}-${timestamp}`;
}