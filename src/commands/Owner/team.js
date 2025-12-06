const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const TeamManagement = require('../../models/team');

// Owner permission - only these IDs can manage team members
const OwnerPermission = [
  "239496212699545601" // Add any other owner IDs here
];

// Configuration for logging
const LogConfig = {
  enabled: true,
  channelId: "1375948964393648259" // Replace with your actual log channel ID
};

function createLogEmbed(client, action, executorId, targetId, targetUsername) {
  const color = action === 'add' ? 0x00ff00 : 0xff0000; // Green for add, Red for remove
  
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
    .setTitle(`Team Management ${action.charAt(0).toUpperCase() + action.slice(1)} Log`)
    .setDescription(`**Action:** ${action === 'add' ? 'Added to' : 'Removed from'} Team Management\n**Target:** ${targetUsername} (<@${targetId}>)\n**Executed by:** <@${executorId}>`)
    .setTimestamp()
    .setFooter({ text: `User ID: ${targetId}` });
}

async function sendLogMessage(client, action, executorId, targetId, targetUsername) {
  if (!LogConfig.enabled || !LogConfig.channelId) return;
  
  try {
    const logChannel = await client.channels.fetch(LogConfig.channelId);
    if (!logChannel) {
      console.error(`Log channel with ID ${LogConfig.channelId} not found`);
      return;
    }
    
    const logEmbed = createLogEmbed(client, action, executorId, targetId, targetUsername);
    await logChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    console.error(`Failed to send team log message: ${error.message}`);
  }
}

function getUser(message, args) {
  let user;
  let ID;

  // Check for a mention
  if (message.mentions.members.first()) {
    user = message.mentions.members.first();
    ID = user.id;
  } 
  // Check for a valid user ID
  else if (args[1] && /^\d{17,19}$/.test(args[1])) {
    user = message.guild.members.cache.get(args[1]) || null;
    ID = args[1];
  } 
  // Default to the message author if neither is provided
  else {
    user = message.member;
    ID = user.id;
  }

  return { user, ID };
}

async function addUserToTeam(client, ID, addedById) {
  const existingUser = await TeamManagement.findOne({ where: { userId: ID } });
  if (existingUser) {
    return 'already_added';
  } else {
    await TeamManagement.create({ 
      userId: ID, 
      addedBy: addedById,
      addedAt: new Date()
    });
    return 'added';
  }
}

async function removeUserFromTeam(client, ID) {
  const existingUser = await TeamManagement.findOne({ where: { userId: ID } });
  if (!existingUser) {
    return 'not_found';
  } else {
    await TeamManagement.destroy({ where: { userId: ID } });
    return 'removed';
  }
}

async function getTeamList(client) {
  const data = await TeamManagement.findAll();
  return data;
}

module.exports = {
  name: 'team',
  category: 'Owner',
  aliases: ["tm", "teammanage"], 
  cooldown: 5,
  description: 'Manage team members who can add/remove NoPrefix users',
  args: false,
  usage: 'team <add/remove/list/reset> [user]',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: true,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  
  execute: async (message, args, client, prefix) => {
    const subcommand = args[0];

    // Check for Owner permission
    if (!OwnerPermission.includes(message.author.id)) {
      return message.channel.send("You don't have permission to use this command.");
    }
    
    const guide = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
      .setTitle("Team Management Commands")
      .setDescription(`**team add <user>**\nAdd a user to team management.\n**team remove <user>**\nRemove a user from team management.\n**team list**\nShows all team management members.\n**team reset**\nRemoves all team members from the database.`)
      .setTimestamp()
      .setThumbnail(message.author.displayAvatarURL({dynamic: true, size: 2048 }));

    // Show help if no subcommand
    if (!subcommand) {
      return message.channel.send({ embeds: [guide] });
    }
    
    switch (subcommand) {
      case 'add': {
        if (!args[1]) {
          return message.channel.send("Provide a Member or a valid User ID.");
        }

        const { ID } = getUser(message, args);
        
        // Check if trying to add themselves
        if (ID === message.author.id) {
          return message.channel.send("You cannot add yourself to team management.");
        }
        
        // Check if trying to add another owner
        if (OwnerPermission.includes(ID)) {
          return message.channel.send("Owners are already part of team management by default.");
        }

        const result = await addUserToTeam(client, ID, message.author.id);
        
        let userObject;
        try {
          userObject = await client.users.fetch(ID);
        } catch (error) {
          return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`);
        }

        // Log the action
        await sendLogMessage(client, 'add', message.author.id, ID, userObject.username);

        if (result === 'already_added') {
          return message.channel.send(`\`${userObject.username}\` is already in team management.`);
        } else {
          return message.channel.send(`Added \`${userObject.username}\` to team management.`);
        }
      }
      
      case 'remove': {
        if (!args[1]) {
          return message.channel.send("Provide a member mention or a valid User ID.");
        }

        const { ID } = getUser(message, args);
        
        // Check if trying to remove themselves
        if (ID === message.author.id) {
          return message.channel.send("You cannot remove yourself from team management.");
        }
        
        // Check if trying to remove another owner
        if (OwnerPermission.includes(ID)) {
          return message.channel.send("You cannot remove owners from team management.");
        }

        try {
          let userObject;
          try {
            userObject = await client.users.fetch(ID);
          } catch (error) {
            return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`);
          }

          const result = await removeUserFromTeam(client, ID);
          
          // Log the action
          await sendLogMessage(client, 'remove', message.author.id, ID, userObject.username);

          if (result === 'not_found') {
            return message.channel.send(`\`${userObject.username}\` was not in team management.`);
          } else {
            return message.channel.send(`Removed \`${userObject.username}\` from team management.`);
          }
        } catch (error) {
          console.error(`Error while removing user ${ID} from team management:`, error.message);
          return message.channel.send(`Could not remove user with ID \`${ID}\`. Ensure the user exists and try again.`);
        }
      }
      
      case 'list': {
        const listData = await getTeamList(client);

        if (!listData || listData.length === 0) {
          return message.channel.send("No team members found.");
        }

        const totalPages = Math.ceil(listData.length / 10);
        let currentPage = 0;

        const generateEmbed = async (page) => {
          const startIndex = page * 10;
          const endIndex = Math.min(startIndex + 10, listData.length);
          const currentMembers = listData.slice(startIndex, endIndex);

          const fetchUserPromises = currentMembers.map(async (entry, index) => {
            try {
              const user = await client.users.fetch(entry.userId);
              const addedBy = await client.users.fetch(entry.addedBy);
              const addedDate = new Date(entry.addedAt).toLocaleDateString();
              return `\`[${startIndex + index + 1}]\` | [${user.username}](https://discord.com/users/${entry.userId})\n└ Added by: ${addedBy.username} on ${addedDate}`;
            } catch (error) {
              console.error(`Error fetching user ${entry.userId}: ${error.message}`);
              return `\`[${startIndex + index + 1}]\` | ID: ${entry.userId} | User not found`;
            }
          });

          const memberList = (await Promise.all(fetchUserPromises)).join("\n\n");
          
          return new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
            .setTitle(`Team Management Members - Page ${page + 1}/${totalPages}`)
            .setDescription(memberList);
        };

        // Create main control dropdown menu
        const createControlDropdown = (totalPages) => {
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("control_menu")
            .setPlaceholder("Select an action");

          // Add page navigation options if multiple pages
          if (totalPages > 1) {
            for (let i = 0; i < totalPages; i++) {
              selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel(`Go to Page ${i + 1}`)
                  .setValue(`page_${i}`)
                  .setDescription(`View members ${i * 10 + 1}-${Math.min((i + 1) * 10, listData.length)}`)
                  .setEmoji('📄')
              );
            }
          }

          // Add refresh option
          selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Refresh List")
              .setValue("refresh")
              .setDescription("Reload the team member list")
              .setEmoji('🔄')
          );

          // Add close option
          selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Close Menu")
              .setValue("close")
              .setDescription("Close this team management menu")
              .setEmoji('❌')
          );
          
          return new ActionRowBuilder().addComponents(selectMenu);
        };
        
        // Send initial message
        const initialEmbed = await generateEmbed(currentPage);
        const controlDropdown = createControlDropdown(totalPages);
        
        try {
          const activeMessage = await message.channel.send({ 
            embeds: [initialEmbed], 
            components: [controlDropdown]
          });

          // Create collector for interactions
          const collector = activeMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 300000, // 5 minutes
            idle: 120000 // 2 minutes
          });

          collector.on("collect", async (interaction) => {
            try {
              const value = interaction.values[0];
              
              if (value === "close") {
                collector.stop("user");
                return;
              } 
              
              if (value === "refresh") {
                // Refresh the team list data
                const refreshedData = await getTeamList(client);
                
                if (!refreshedData || refreshedData.length === 0) {
                  await interaction.update({ 
                    content: "No team members found after refresh.",
                    embeds: [],
                    components: []
                  });
                  collector.stop("no_data");
                  return;
                }
                
                // Update listData and recalculate pages
                listData.length = 0;
                listData.push(...refreshedData);
                const newTotalPages = Math.ceil(listData.length / 10);
                currentPage = 0; // Reset to first page
                
                const refreshedEmbed = await generateEmbed(currentPage);
                const refreshedDropdown = createControlDropdown(newTotalPages);
                
                await interaction.update({ 
                  content: `✅ Refreshed! Found ${listData.length} team members.`,
                  embeds: [refreshedEmbed],
                  components: [refreshedDropdown]
                });
                
                // Clear the refresh message after 3 seconds
                setTimeout(async () => {
                  try {
                    await activeMessage.edit({ 
                      content: null,
                      embeds: [refreshedEmbed],
                      components: [refreshedDropdown]
                    });
                  } catch (error) {
                    console.error("Error clearing refresh message:", error);
                  }
                }, 3000);
              }
              
              if (value.startsWith("page_")) {
                currentPage = parseInt(value.split("_")[1]);
                const newEmbed = await generateEmbed(currentPage);
                const newDropdown = createControlDropdown(totalPages);
                
                await interaction.update({ 
                  embeds: [newEmbed],
                  components: [newDropdown]
                });
              }
            } catch (error) {
              console.error("Error handling team list interaction:", error);
              try {
                if (!interaction.replied && !interaction.deferred) {
                  await interaction.reply({ 
                    content: "An error occurred. Please try again.", 
                    ephemeral: true 
                  });
                }
              } catch (finalError) {
                console.error("Failed to send error notification:", finalError);
              }
            }
          });

          collector.on("end", async (collected, reason) => {
            try {
              if (reason === "time" || reason === "idle") {
                await activeMessage.edit({ 
                  content: "⏰ Team management menu timed out.", 
                  components: [] 
                }).catch(() => {});
              } else if (reason === "user") {
                await activeMessage.delete().catch(() => {});
              } else {
                await activeMessage.edit({ 
                  components: [] 
                }).catch(() => {});
              }
            } catch (error) {
              console.error("Error ending team collector:", error);
            }
          });
        } catch (error) {
          console.error("Error sending team list message:", error);
          return message.channel.send("Error displaying the team list. Please try again.");
        }
        
        break;
      }
      
      case 'reset': {
        const listData = await getTeamList(client);
      
        if (!listData || listData.length === 0) {
          return message.channel.send(`No team members in the database.`);
        }
      
        try {
          await TeamManagement.destroy({ where: {} });
          return message.channel.send(`Reset team management database. Removed ${listData.length} members.`);
        } catch (error) {
          console.error("Error resetting team database:", error);
          return message.channel.send(`Failed to reset team database: ${error.message}`);
        }
      }
      
      default: {
        return message.channel.send({ embeds: [guide] });
      }
    }
  }
};