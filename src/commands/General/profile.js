const { EmbedBuilder } = require("discord.js");
const User = require('../../schema/User');
const moment = require(`moment`);
require(`moment-duration-format`);
const day = require("dayjs");
const axios = require("axios");
module.exports = {
  name: 'profile',
  category: 'General',
  aliases: ['pf', 'pr'],
  cooldown: 5,
  description: 'View your profile or someone else\'s profile',
  args: false,
  usage: '[user mention or ID]',
  userPrams: [],
  botPrams: [],
  owner: false,
  execute: async (message, args, client, prefix) => {
    message.channel.sendTyping();
    
    // Get the target user: mentioned user, user ID, or message author
    let targetUser;
    
    if (args[0]) {
      // Check if it's a mention
      if (message.mentions.members.size > 0) {
        targetUser = message.mentions.members.first();
      } 
      // Check if it's a valid ID
      else if (/^\d{17,19}$/.test(args[0])) {
        try {
          targetUser = await message.guild.members.fetch(args[0]);
        } catch (error) {
          return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('Red')
                .setDescription('❌ | Could not find a user with that ID!')
            ]
          });
        }
      } 
      // Invalid argument
      else if (args[0] && !message.mentions.members.size && !/^\d{17,19}$/.test(args[0])) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Red')
              .setDescription('❌ | Please provide a valid user mention or ID!')
          ]
        });
      }
    }
    
    // If no valid target was found, use the message author
    if (!targetUser) {
      targetUser = message.member;
    }
    
    // const guildd = await client.guilds.fetch("1136940882420056094"); // add guild id
    const guildd = await client.guilds.fetch("1221909487472869619"); // add guild id
    const sus = await guildd.members.fetch(targetUser.id).catch((e) => {});
        
    let badges = "";
    if (sus) {
      const dev = sus.roles.cache.has("1253763122087591986");
      if(dev === true) badges = badges+`\n<:Dev:1245317264610164808> **Developer**`;
      const own = sus.roles.cache.has("1253763122532061224");
      if(own === true) badges = badges+`\n<:owner:1256111904162582539> **Owner**`;
      const admin = sus.roles.cache.has("1253763107969306694");
      if(admin === true) badges = badges+`\n<:Admin:1260860730018758656> **Admin**`;
      const communitymanager = sus.roles.cache.has("1286419579136114784");
      if(communitymanager === true) badges = badges+`\n<:Manager:1327368838118899753> **Community Manager**`;
      const sup = sus.roles.cache.has("1260857860909305896");
      if(sup === true) badges = badges+`\n<a:premium:1295495411330584778> **Premium User**`;
      const mod = sus.roles.cache.has("1253764016778772583");
      if(mod === true) badges = badges+`\n<:moderator:1260861271759392830> **Moderator**`;
      const supteam = sus.roles.cache.has("1253763558781616220");
      if(supteam === true) badges = badges+`\n<:SupportTeam:1260861498679361640> **Support Team**`;
      const bug = sus.roles.cache.has("1253763945391722598");
      if(bug === true) badges = badges+`\n<:BugHunter_icone:1260862269475000391> **Bug Hunter**`;
      const vip = sus.roles.cache.has("1268429186314539028");
      if(vip === true) badges = badges+`\n<:VIP:1295588254560686093> **VIP**`;
      const partner = sus.roles.cache.has("1295580838360121505");
      if(partner === true) badges = badges+`\n<:partnership:1309967435872342128> **Partners**`;
      const fri = sus.roles.cache.has("1253763656336805973");
      if(fri === true) badges = badges+`\n<:friend:1260861861319147530> **Owner's Friend**`;
      const supporter = sus.roles.cache.has("1269995038457462834");
      if(supporter === true) badges = badges+`\n<:supporters:1292151666866520197> **Supporter**`;
      const botuser = sus.roles.cache.has("1253763836071383111");
      if(botuser === true) badges = badges+`\n<:users:1260862942572707882> **Bot User**`;
    }
    
    const usericon = targetUser.displayAvatarURL({dynamic: true});
    
    User.findById(targetUser.id, async (err, u) => {
      if (err) console.log(err);
      if (!u) {
        const newUser = new User({ _id: targetUser.id });
        newUser.save().catch(e => console.log(e));
      }
      const bio = u ? (u.bio ? u.bio : 'No bio set. Use `' + prefix + 'bio <bio>` to set your bio.') : 'No bio set.';

      // Create embed with bio and custom badges only
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${targetUser.user.username}`, iconURL: targetUser.user.displayAvatarURL({ dynamic: true})})
        .setThumbnail(usericon)
        .addFields([
          { name: `**__Bio__**`, value: `${bio}` },
          { name: `**__Server Badges__**`, value: `${badges ? badges : `<:x_cross:1250674944057278535> Oops! Looks Like You Don't Have Any Type Of Badge To Be Displayed! You Can Get One By Joining Our [Support Server](https://discord.gg/w77ymEU82a)`}`}
        ])
        .setColor(client.ankushcolor)
        .setTimestamp();

      // Send the embed
      message.channel.send({embeds: [embed]});
    });
  }
}