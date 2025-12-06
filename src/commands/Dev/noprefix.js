const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const NoPrefix = require('../../models/noprefix');
const TeamManagement = require('../../models/team');

const NoPrefixAccess = [
  "239496212699545601", "622786214776406017", "677952614390038559"
];

// Special permission for reset command - only these IDs can use reset
const ResetPermission = [
  "239496212699545601" // Add any other IDs that should have reset permission
];

// Owner permission - only these IDs can manage team and advanced settings
const OwnerPermission = [
  "239496212699545601" // Add any other owner IDs here
];

// Configuration for logging
const LogConfig = {
  enabled: true,
  channelId: "1369340576591253639" // Replace with your actual log channel ID
};

// Check if user is a team member
async function isTeamMember(userId) {
  const teamMember = await TeamManagement.findOne({ where: { userId: userId } });
  return !!teamMember;
}

// Check if user has NoPrefix permissions (owner, team member, or legacy access)
async function hasNoPrefixPermission(userId) {
  // Check if user is owner
  if (OwnerPermission.includes(userId)) {
    return { hasPermission: true, type: 'owner' };
  }
  
  // Check if user is team member
  if (await isTeamMember(userId)) {
    return { hasPermission: true, type: 'team' };
  }
  
  // Check legacy access (for backward compatibility)
  if (NoPrefixAccess.includes(userId)) {
    return { hasPermission: true, type: 'legacy' };
  }
  
  return { hasPermission: false, type: 'none' };
}

function createEmbed(client, ID, added, allGuilds) {
  const description = added
    ? `${added} no prefix to <@${ID}> for ${allGuilds ? 'all guilds' : 'this guild'}`
    : `Already ${added ? 'added' : 'removed'} no prefix to <@${ID}> for ${allGuilds ? 'all guilds' : 'this guild'}`;

  return new EmbedBuilder()
    .setColor("#2f3136")
    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
    .setTimestamp()
    .setDescription(description);
}

function createLogEmbed(client, action, executorId, targetId, targetUsername, executorType) {
  const color = action === 'add' ? 0x00ff00 : 0xff0000; // Green for add, Red for remove
  
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
    .setTitle(`NoPrefix ${action.charAt(0).toUpperCase() + action.slice(1)} Log`)
    .setDescription(`**Action:** ${action === 'add' ? 'Added to' : 'Removed from'} NoPrefix list\n**Target:** ${targetUsername} (<@${targetId}>)\n**Executed by:** <@${executorId}> (${executorType})`)
    .setTimestamp()
    .setFooter({ text: `User ID: ${targetId}` });
}

async function sendLogMessage(client, action, executorId, targetId, targetUsername, executorType) {
  if (!LogConfig.enabled || !LogConfig.channelId) return;
  
  try {
    const logChannel = await client.channels.fetch(LogConfig.channelId);
    if (!logChannel) {
      console.error(`Log channel with ID ${LogConfig.channelId} not found`);
      return;
    }
    
    const logEmbed = createLogEmbed(client, action, executorId, targetId, targetUsername, executorType);
    await logChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    console.error(`Failed to send log message: ${error.message}`);
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

async function addUserToNoPrefixList(client, ID) {
  const existingUser = await NoPrefix.findOne({ where: { userId: ID } });
  if (existingUser) {
    return 'already_added';
  } else {
    await NoPrefix.create({ userId: ID });
    return createEmbed(client, ID, true, true);
  }
}

async function removeUserFromNoPrefixList(client, ID) {
  const existingUser = await NoPrefix.findOne({ where: { userId: ID } });
  if (!existingUser) {
    return 'not_found';
  } else {
    await NoPrefix.destroy({ where: { userId: ID } });
    return createEmbed(client, ID, false, true);
  }
}

async function getNoPrefixList(client) {
  const data = await NoPrefix.findAll();
  return data.map(entry => entry.userId);
}

module.exports = {
  name: 'noprefix',
  category: 'Dev',
  aliases: ["np"], 
  cooldown: 5,
  description: 'Manage users who can use commands without prefix',
  args: false,
  usage: 'noprefix <add/remove/list/reset/setlog> [user/channelID]',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  
  execute: async (message, args, client, prefix) => {
    const subcommand = args[0];
    const { user, ID } = getUser(message, args);

    // Check for permissions
    const permissionCheck = await hasNoPrefixPermission(message.author.id);
    if (!permissionCheck.hasPermission) {
      return message.channel.send("You don't have permission to use this command.");
    }
    
    const guide = new EmbedBuilder()
      .setColor(0x00ff00)
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
      .setDescription(`**noprefix add <user>**\nAdd a user to noprefix users for all servers.\n**noprefix remove <user>**\nRemove a user from noprefix users from all servers.\n**noprefix list**\nShows all the users in noprefix database.\n**noprefix reset**\nRemoves all the users from noprefix users from the database (Owner only).\n**noprefix setlog <channelID>**\nSet the channel for logging add/remove actions (Owner only).\n**noprefix check <user>**\nCheck if a user has noprefix access.`)
      .setTimestamp()
      .setThumbnail(message.author.displayAvatarURL({dynamic: true, size: 2048 }))
      .setFooter({ text: `Your access level: ${permissionCheck.type}` });

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
        const result = await addUserToNoPrefixList(client, ID);
        
        let userObject;
        try {
          userObject = await client.users.fetch(ID);
        } catch (error) {
          return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`);
        }

        // Log the action
        await sendLogMessage(client, 'add', message.author.id, ID, userObject.username, permissionCheck.type);

        if (result === 'already_added') {
          return message.channel.send(`Already added no prefix to \`${userObject.username}\` for all guilds.`);
        } else {
          return message.channel.send(`Added no prefix to \`${userObject.username}\` for all guilds.`);
        }
      }
      
      case 'remove': {
        if (!args[1]) {
          return message.channel.send("Provide a member mention or a valid User ID.");
        }

        const { ID } = getUser(message, args);

        try {
          let userObject;
          try {
            userObject = await client.users.fetch(ID);
          } catch (error) {
            return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`);
          }

          // Attempt to remove the user from the NoPrefix list
          const result = await removeUserFromNoPrefixList(client, ID);
          
          // Log the action regardless of whether the user was found
          await sendLogMessage(client, 'remove', message.author.id, ID, userObject.username, permissionCheck.type);

          if (result === 'not_found') {
            return message.channel.send(`\`${userObject.username}\` was not in the no-prefix list for all guilds.`);
          } else {
            return message.channel.send(`Removed no-prefix from \`${userObject.username}\` for all guilds.`);
          }
        } catch (error) {
          console.error(`Error while removing user ${ID} from no-prefix list:`, error.message);
          return message.channel.send(`Could not remove user with ID \`${ID}\`. Ensure the user exists and try again.`);
        }
      }
      
      case 'check': {
        if (!args[1]) {
          return message.channel.send("Provide a member mention or a valid User ID.");
        }

        const { ID } = getUser(message, args);
        
        try {
          let userObject;
          try {
            userObject = await client.users.fetch(ID);
          } catch (error) {
            return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`);
          }

          const hasNoPrefix = await NoPrefix.findOne({ where: { userId: ID } });
          
          let status;
          let color;
          
          if (hasNoPrefix) {
            status = "Has NoPrefix Access";
            color = 0x00ff00; // Green
          } else {
            status = "No NoPrefix Access";
            color = 0xff0000; // Red
          }

          const checkEmbed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
            .setTitle("NoPrefix Status Check")
            .setDescription(`**User:** ${userObject.username} (<@${ID}>)\n**Status:** ${status}`)
            .setTimestamp()
            .setThumbnail(userObject.displayAvatarURL({ dynamic: true }));

          return message.channel.send({ embeds: [checkEmbed] });
        } catch (error) {
          console.error(`Error checking noprefix status for user ${ID}:`, error.message);
          return message.channel.send(`Could not check status for user with ID \`${ID}\`.`);
        }
      }
      
      case 'setlog': {
        // Only allow log channel setting for owners
        if (!OwnerPermission.includes(message.author.id)) {
          return message.channel.send(`You don't have permission to set the log channel. Only owners can use this command.`);
        }
        
        if (!args[1]) {
          return message.channel.send("Please provide a valid channel ID.");
        }
        
        const channelId = args[1];
        
        // Validate channel ID format
        if (!/^\d{17,19}$/.test(channelId)) {
          return message.channel.send("Please provide a valid channel ID.");
        }
        
        try {
          // Verify the channel exists and the bot has access
          const channel = await client.channels.fetch(channelId);
          
          if (!channel) {
            return message.channel.send("Channel not found. Please check the ID and try again.");
          }
          
          if (!channel.isTextBased()) {
            return message.channel.send("The provided channel is not a text channel.");
          }
          
          // Update the log channel ID
          LogConfig.channelId = channelId;
          
          // Send a test message to the channel
          const testEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("Log Channel Setup")
            .setDescription("This channel has been set up to receive NoPrefix command logs.")
            .setTimestamp();
            
          await channel.send({ embeds: [testEmbed] });
          
          return message.channel.send(`Log channel has been set to <#${channelId}>.`);
        } catch (error) {
          console.error(`Error setting log channel: ${error.message}`);
          return message.channel.send(`Could not set log channel: ${error.message}`);
        }
      }
      
      case 'list': {
        const listData = await getNoPrefixList(client);

        if (!listData || listData.length === 0) {
          return message.channel.send("Nothing to Show");
        }

        const totalPages = Math.ceil(listData.length / 10);
        let currentPage = 0;

        const generateEmbed = async (page) => {
          const startIndex = page * 10;
          const endIndex = Math.min(startIndex + 10, listData.length);
          const currentMembers = listData.slice(startIndex, endIndex);

          const fetchUserPromises = currentMembers.map(async (userId, index) => {
            try {
              const user = await client.users.fetch(userId);
              return `\`[${startIndex + index + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | [${user.username}](https://discord.com/users/${userId})`;
            } catch (error) {
              console.error(`Error fetching user ${userId}: ${error.message}`);
              return `\`[${startIndex + index + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | User not found`;
            }
          });

          const memberList = (await Promise.all(fetchUserPromises)).join("\n");
          
          return new EmbedBuilder()
            .setColor(0x00ff00)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true})})
            .setTitle(`Total No Prefix Users - Page ${page + 1}/${totalPages}`)
            .setDescription(memberList);
        };

        // Create dropdown menu options for pages
        const createPageDropdown = (totalPages) => {
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("page_select")
            .setPlaceholder("Select a page to view");
          
          // Add options for each page
          for (let i = 0; i < totalPages; i++) {
            selectMenu.addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel(`Page ${i + 1}`)
                .setValue(`${i}`)
                .setDescription(`View users ${i * 10 + 1}-${Math.min((i + 1) * 10, listData.length)}`)
            );
          }
          
          return new ActionRowBuilder().addComponents(selectMenu);
        };
        
        // Create close button
        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId("close")
            .setLabel("Close")
        );
        
        // Send initial message
        const initialEmbed = await generateEmbed(currentPage);
        
        // Add components based on number of pages
        const components = [];
        if (totalPages > 1) {
          components.push(createPageDropdown(totalPages));
        }
        components.push(closeButton);
        
        try {
          const activeMessage = await message.channel.send({ 
            embeds: [initialEmbed], 
            components: components
          });

          // Create collector for interactions
          const collector = activeMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 120000, // 2 minutes
            idle: 60000 // 1 minute
          });

          collector.on("collect", async (interaction) => {
            try {
              if (interaction.customId === "close") {
                collector.stop("user");
                return;
              } 
              
              if (interaction.customId === "page_select") {
                currentPage = parseInt(interaction.values[0]);
                const newEmbed = await generateEmbed(currentPage);
                
                await interaction.update({ 
                  embeds: [newEmbed],
                  components: components
                });
              }
            } catch (error) {
              console.error("Error handling interaction:", error);
              // Try to notify the user of the error
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
                  content: "Navigation timed out.", 
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
              console.error("Error ending collector:", error);
            }
          });
        } catch (error) {
          console.error("Error sending initial message:", error);
          return message.channel.send("Error displaying the list. Please try again.");
        }
        
        break;
      }
      
      case 'reset': {
        // Check if user has special reset permission (owners only)
        if (!OwnerPermission.includes(message.author.id)) {
          return message.channel.send(`You don't have permission to use the reset command. Only owners can reset the database.`);
        }
        
        const listData = await getNoPrefixList(client);
      
        if (!listData || listData.length === 0) {
          return message.channel.send(`No one is in No Prefix Database.`);
        }
      
        try {
          await NoPrefix.destroy({ where: {} });
          return message.channel.send(`Reset NoPrefix database. Removed ${listData.length} users.`);
        } catch (error) {
          console.error("Error resetting database:", error);
          return message.channel.send(`Failed to reset database: ${error.message}`);
        }
      }
      
      default: {
        return message.channel.send({ embeds: [guide] });
      }
    }
  }
};