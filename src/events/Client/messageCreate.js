const { EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const Maintenance = require('../../models/maintenance'); // Add Maintenance model
const { IgnoreChannel } = require('../../database');
const db = require('../../models/prefix');
const { cooldown } = require("../../handlers/functions.js");
const { WebhookClient } = require("discord.js");
const NoPrefix = require('../../models/noprefix');
const Blacklist = require('../../models/blacklist');
const { RateLimitManager } = require("@sapphire/ratelimits");
const AFK = require('../../models/afk');
const moment = require('moment');
const User = require('../../schema/User');

const webHookurl = "https://discord.com/api/webhooks/1365060094919708712/1KOKCXDruk_IBkB2zc9LK0fWKuHfK_rm8Z0z79lhJX1DT5LTxj2SWsSi7PQFH0hC2JKx";
const hook = new WebhookClient({ url: webHookurl });
const spamRateLimitManager = new RateLimitManager(10000, 7);

// Command usage rate limiter
const commandRateLimitManager = new RateLimitManager(10000, 8);

// User-specific reaction configuration
const userReactions = {
  '622786214776406017': ['<:red_crown:1297517994217439313>', '<:developer:1302188880761585744>', '<:Atul:1355104845396312075>'], // Another user example
};

module.exports = {
  name: 'messageCreate',
  run: async (client, message) => {
    if (message.author.bot || message.webhookId || !message.guild || !message.channel) return;
    if (!message.guild) return;
    if (message.channel.type == ChannelType.DM || message.channel.type == ChannelType.GuildForum) return;
    if (message.partial) await message.fetch();
    
     // ===== AFK SYSTEM START =====
    try {
      // Check if message author is AFK and automatically remove AFK status
      const afkAuthor = await AFK.findOne({ where: { userId: message.author.id } });
      
      if (afkAuthor) {
        // Don't remove AFK status if they're using the AFK command
        var prefix = client.prefix;
        const dbPrefix = await db.findOne({ where: { id: message.guildId } });
        if (dbPrefix && dbPrefix.prefix) prefix = dbPrefix.prefix;
        
        // Skip AFK removal if user is using the AFK command
        if (message.content.toLowerCase().startsWith(`${prefix}afk`) || 
            message.content.toLowerCase().startsWith(`${prefix}away`)) {
          // Do nothing - keep AFK status
        } else {
          // Calculate time spent AFK
          const afkTime = moment(afkAuthor.timestamp).fromNow(true);
          const mentions = afkAuthor.mentionCount || 0;
          
          // Delete the AFK entry
          await afkAuthor.destroy();
          
          // Reset nickname if possible
          try {
            const member = message.member;
            if (member && member.manageable) {
              const currentNick = member.nickname || message.author.username;
              if (currentNick.startsWith('[AFK] ')) {
                await member.setNickname(currentNick.substring(6));
              }
            }
          } catch (err) {
            // Silently fail if can't change nickname
            console.log('Could not update nickname: ', err.message);
          }
          
          // Notify the user their AFK status was removed
          const welcomeBack = await message.reply({ 
            embeds: [
              new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({ 
                  name: `Welcome back ${message.author.username}!`, 
                  iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                })
                .setDescription(`Your AFK status has been removed. You were AFK for ${afkTime} and received ${mentions} mention${mentions !== 1 ? 's' : ''}.`)
                .setTimestamp()
            ]
          });
          
          // Delete the welcome back message after 10 seconds
          setTimeout(() => {
            welcomeBack.delete().catch(e => console.error('Could not delete AFK welcome back message:', e));
          }, 10000);
        }
      }
      
      // Check for mentions of AFK users
      if (message.mentions.users.size > 0) {
        const mentionedUsers = message.mentions.users;
        
        for (const [userId, user] of mentionedUsers) {
          // Skip if mentioned user is the same as message author
          if (userId === message.author.id) continue;
          
          const afkUser = await AFK.findOne({ where: { userId } });
          
          if (afkUser) {
            // Increment mention count
            await afkUser.update({ mentionCount: (afkUser.mentionCount || 0) + 1 });
            
            // Calculate how long they've been AFK
            const afkTime = moment(afkUser.timestamp).fromNow();
            
            const afkMentionEmbed = new EmbedBuilder()
              .setColor('#FFA500')
              .setAuthor({ 
                name: `${user.username} is AFK`, 
                iconURL: user.displayAvatarURL({ dynamic: true }) 
              })
              .setDescription(`${user.username} is currently AFK (since ${afkTime})`)
              .addFields([{ name: 'Reason', value: afkUser.reason || 'No reason provided' }])
              .setFooter({ text: 'They will see your message when they return' })
              .setTimestamp();
            
            await message.reply({ embeds: [afkMentionEmbed] });
          }
        }
      }
    } catch (error) {
      console.error('Error in AFK handling:', error);
    }
    // ===== AFK SYSTEM END =====
    
    // User-specific mention reaction system
const mentionedUsers = message.mentions.users;
if (mentionedUsers.size > 0 && !message.reference) { // Only react if not a reply
  for (const [userId, user] of mentionedUsers) {
    // Check if the mentioned user has a custom reaction set
    if (userReactions[userId]) {
      try {
        // Delay between reactions to avoid rate limiting
        for (const reaction of userReactions[userId]) {
          await message.react(reaction);
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between reactions
        }
      } catch (reactionError) {
        console.error(`Error adding reactions for user ${userId}:`, reactionError);
      }
    }
  }
}

// Owner mention reaction system (kept for backward compatibility)
if (client.config.ownerID.some(ownerId => message.content.includes(`<@${ownerId}>`)) && !message.reference) { // Only react if not a reply
  try {
    const ownerMentionReactions = ['<:red_crown:1297517994217439313>', '<:developer:1302188880761585744>', '<:Ankush:1294695754904113244>'];
    for (const reaction of ownerMentionReactions) {
      await message.react(reaction);
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between reactions
    }
  } catch (reactionError) {
    console.error('Error adding reactions:', reactionError);
  }
}
    
    if (message.content.toLowerCase().includes(`jsk`)) {
      client.dokdo.run(message);
    }

    let [owner] = await Promise.all([
      await client.config.ownerID.find((x) => x === message.author.id)
    ]);
    
    let blacklistUser = await Blacklist.findOne({ where: { userId: message.author.id } });
    if (owner) blacklistUser = false;

    // Check maintenance mode
        const maintenance = await Maintenance.findOne();
        const isMaintenanceActive = maintenance ? maintenance.isActive : false;
        const maintenanceReason = maintenance ? maintenance.reason : 'No reason provided';
    
    const prefixMatch = "239496212699545601";
    var prefix = client.prefix;
    const dbPrefix = await db.findOne({ where: { id: message.guildId } });

    if (dbPrefix && dbPrefix.prefix) prefix = dbPrefix.prefix;

    const mentionRegex = RegExp(`^<@!?${client.user.id}>$`);
    if (message.content.match(mentionRegex)) {
      // Define the action row for buttons first
      const ankush = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=414530792776&scope=bot%20applications.commands`)
          .setLabel(`Invite`),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/invite/w77ymEU82a`)
          .setLabel(`Support Server`)
      );
      
      const mentionEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription(`Hey, It's [**${client.user.username}**](https://discord.com/invite/w77ymEU82a), A Quality Music Bot With Breathtaking Features For Greater Experience While On Discord.`)
        .addFields([{
          name: `__**Guild Settings**__`, value: `My Prefix: **${prefix}**\nLanguage: **English**\nServer I'd: **${message.guild.id}**`, inline: false
        }])
        .setFooter({text: `Developed With ❤️ By The Ankush`, iconURL: message.author.displayAvatarURL({ dynamic: true })});

      const mentionRlBucket = spamRateLimitManager.acquire(`${message.author.id}`);
      if (mentionRlBucket.limited && !owner) {
        await Blacklist.create({ userId: message.author.id });
        const blacklistEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('⚠️ Blacklisted')
          .setDescription('You have been blacklisted due to excessive mentions.')
          .setTimestamp();
        return message.reply({ embeds: [blacklistEmbed] });
      }
      try {
        mentionRlBucket.consume();
      } catch (e) {}

      return message.reply({ embeds: [mentionEmbed], components: [ankush] });
    }

    async function getNoPrefixList(client) {
      const data = await NoPrefix.findAll();
      return data.map(entry => entry.userId);
    }
    
    const noprefix = await getNoPrefixList(client);
    if (noprefix.includes(message.author.id) && !message.content.startsWith(prefix)) {
      prefix = "";
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    
    const [matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

     // Block commands during maintenance (except for the maintenance command for owners)
        if (isMaintenanceActive && command.name !== 'maintenance' && !owner) {
            const maintenanceEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('🚧 Maintenance Mode Active')
                .setDescription(`The bot is currently under maintenance.\n**Reason:** ${maintenanceReason}\nWe apologize for the inconvenience and appreciate your patience.`)
                .setTimestamp();
            return message.reply({ embeds: [maintenanceEmbed] });
        }
      
    // Check if the channel is in the ignore list
    const ignoredChannel = await IgnoreChannel.findOne({ 
      where: { 
        guildId: message.guild.id, 
        channelId: message.channel.id 
      } 
    });
    
    // If channel is ignored, return early unless it's a bot owner
    if (ignoredChannel) {
      // Only allow bot owners to bypass
      const isOwner = client.config.ownerID.includes(message.author.id);
      if (!isOwner) {
        // Create and send an embed to inform users that the channel is ignored
        const embed = new EmbedBuilder()
          .setTitle('Channel Ignored')
          .setDescription('This channel is set to ignore bot commands. Please use a different channel.')
          .setColor('#FF0000') // Red color for warning
          .setTimestamp();
        await message.reply({ embeds: [embed] });
        return;
      }
    }
    // END OF UNIFIED COMMAND PROCESSING
    
    if (blacklistUser) {
      const blacklistEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Access Denied')
        .setDescription('You are blacklisted and can\'t use my commands.')
        .setTimestamp();
      return message.reply({ embeds: [blacklistEmbed] });
    }

     // Check for command spam/abuse
    if (!owner) {
      const commandRateBucket = commandRateLimitManager.acquire(`${message.author.id}`);
      
      // If user has exceeded the command limit
      if (commandRateBucket.limited) {
        // Auto-blacklist the user
        await Blacklist.create({ 
          userId: message.author.id,
          reason: "Automatic blacklist due to excessive command usage",
          date: new Date()
        });
        
        // Send blacklist notification
        const blacklistEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('⚠️ Auto-Blacklisted')
          .setDescription('You have been blacklisted for excessive command usage. If you believe this is an error, please contact the bot owner in the support server.')
          .setTimestamp();
        
        // Log to webhook
        const blacklistLogEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Auto-Blacklist System')
          .setDescription(`User <@${message.author.id}> (${message.author.tag}) has been auto-blacklisted for excessive command usage.`)
          .addFields([
            { name: 'User ID', value: message.author.id, inline: true },
            { name: 'Server', value: message.guild.name, inline: true },
            { name: 'Channel', value: message.channel.name, inline: true },
            { name: 'Trigger Command', value: commandName, inline: true },
            { name: 'Time', value: new Date().toISOString(), inline: true }
          ])
          .setTimestamp();
        
        hook.send({ embeds: [blacklistLogEmbed] });
        
        return message.reply({ embeds: [blacklistEmbed] });
      }
      
      // Consume a token from the bucket
      try {
        commandRateBucket.consume();
      } catch (e) {}
    }
    
    // Permission checks with embeds
    const missingPermsEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Missing Permissions');

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('SendMessages'))) {
      missingPermsEmbed.setDescription('I need Send Messages permission to function properly.');
      return message.author.send({ embeds: [missingPermsEmbed] }).catch(() => {});
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('ViewChannel'))) return;
    
    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('EmbedLinks'))) {
      missingPermsEmbed.setDescription('I need Embed Links permission to function properly.');
      return message.channel.send({ embeds: [missingPermsEmbed] });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('ReadMessageHistory'))) {
      missingPermsEmbed.setDescription('I need Read Message History permission to function properly.');
      return message.channel.send({ embeds: [missingPermsEmbed] });
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('UseExternalEmojis'))) {
      missingPermsEmbed.setDescription('I need Use External Emojis permission to function properly.');
      return message.channel.send({ embeds: [missingPermsEmbed] });
    }

    // User permissions check
    if (command.userPrams) {
      if (!message.member.permissions.has(PermissionsBitField.resolve(command.userPrams || []))) {
        const userPermsEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Insufficient Permissions')
          .setDescription(`You are missing the following permissions: ${command.userPrams.join(', ')}`)
          .setTimestamp();
        return message.channel.send({ embeds: [userPermsEmbed] }).then(msg => 
          setTimeout(() => { msg.delete().catch(e => null) }, 5000)
        );
      }
    }

    // Bot permissions check
    if (command.botPrams) {
      if (!message.channel.permissionsFor(client.user.id).has(PermissionsBitField.resolve(command.botPrams || []))) {
        const botPermsEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Bot Permissions Required')
          .setDescription(`I am missing the following permissions: ${command.botPrams.join(', ')}`)
          .setTimestamp();
        return message.channel.send({ embeds: [botPermsEmbed] }).then(msg => 
          setTimeout(() => { msg.delete().catch(e => null) }, 5000)
        );
      }
    }

    // Command usage help embed
    if (command.args && !args.length) {
      let reply = '';
      if (command.name) reply += `**Command Name**\n\`-\`${command.name}\n`;
      if (command.description) reply += `**Command Description**\n\`-\`${command.description}`;
      if (command.aliases) reply += `\n**Command Aliases**\n\`-\`${command.aliases.join(", ")}`;
      if (command.usage) reply += `\n**Command Usage**\n\`-\`${command.name} ${command.usage}`;
      if (command.cooldown) reply += `\n**Command Cooldown**\n\`-\`${command.cooldown}s`;
      if (command.botPrams) reply += `\n**Command Permission**\n\`-\`${command.botPrams}`;
      if (command.userPrams) {
        reply += `\n\`\`\`diff\n- [] = optional argument\n- <> = required argument\n- Do NOT type these when using commands!\`\`\``;
      }

      const helpEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(reply)
        .setTimestamp();
      
      return message.channel.send({ embeds: [helpEmbed] });
    }

    // Owner command check
    if (command.owner) {
      const ownerEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: `| You are not eligible to use that command.`,
          iconURL: message.guild.iconURL({ dynamic: true })
        });

      if (client.owner) {
        const owner = client.owner.find((x) => x === message.author.id);
        if (!owner) return message.channel.send({ embeds: [ownerEmbed] });
      }
    }

    // Command logging
    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${message.guild.name}`,
        iconURL: message.guild.iconURL({ dynamic: true })
      })
      .addFields([
        {
          name: `Information`,
          value: `> • **Command Author:** ${message.author.tag}(<@${message.author.id}>)\n> • **Command Name:** [${command.name}](https://discord.com/channels/${message.guild.id}/${message.channel.id})\n> • **Channel Id:** ${message.channel.id}\n> • **Channel Name:** ${message.channel.name}\n> • **Guild Name:** ${message.guild.name}\n> • **Guild Id:** ${message.guild.id}`,
        },
      ])
      .setColor(client.ankushcolor)
      .setThumbnail(message.author.avatarURL({ dynamic: true }))
      .setTimestamp();

    if (args.length > 0) {
      logEmbed.addFields({
        name: "Arguments",
        value: args.join(" "),
        inline: true,
      });
    }
    hook.send({ embeds: [logEmbed] });

    // Cooldown check
    if (cooldown(message, command) && !client.owner.includes(message.author.id)) {
      const cooldownEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Cooldown Active')
        .setDescription(`You are on cooldown, wait **${cooldown(message, command).toFixed()}** Seconds to use this command again.`)
        .setTimestamp();
      return message.reply({ embeds: [cooldownEmbed] });
    }

    // Player checks
    const player = client.manager.players.get(message.guild.id);
    if (command.player && !player) {
      const noPlayerEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('No Active Player')
        .setDescription('There is no music playing in this server.')
        .setTimestamp();
      return message.reply({ embeds: [noPlayerEmbed] });
    }

    if (command.inVoiceChannel && !message.member.voice.channelId) {
      const voiceChannelEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Voice Channel Required')
        .setDescription('You need to be in a voice channel to use this command.')
        .setTimestamp();
      return message.reply({ embeds: [voiceChannelEmbed] });
    }

    if (command.sameVoiceChannel && message.guild.members.me.voice.channel) {
      if (message.guild.members.me.voice.channelId !== message.member.voice.channelId) {
        const sameChannelEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Same Voice Channel Required')
          .setDescription('You need to be in the same voice channel as me to use this command.')
          .setTimestamp();
        return message.reply({ embeds: [sameChannelEmbed] });
      }
    }

    // Execute command
    try {
      command.execute(message, args, client, prefix);
      // Increment commandsUsed for the user
      User.findById(message.author.id, (err, user) => {
        if (!err && user) {
          user.commandsUsed = (user.commandsUsed || 0) + 1;
          user.save().catch(() => {});
        }
      });
    } catch (error) {
      console.log(error);
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Command Error')
        .setDescription("There was an error executing that command.\nI have contacted the owner of the bot to fix it immediately.")
        .setTimestamp();
      return message.channel.send({ embeds: [errorEmbed] });
    }
  }
};