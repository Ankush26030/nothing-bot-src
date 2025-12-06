const { ChannelType, EmbedBuilder, WebhookClient, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const blacklistedServerService = require('../../services/blacklistedServerService');
const web = new WebhookClient({url : `https://discord.com/api/webhooks/1365059336640139335/CsUcCCUPuIf1777PRGz1VvJd60aRReCH5xLJKVBlpRui9A_fRUZj0rkqTlxYwOqR73U1`});

module.exports = {
  name: "guildCreate",
  run: async (client, guild) => {
    try {
      // Check if the server is blacklisted
      const isBlacklisted = await blacklistedServerService.isBlacklisted(guild.id);
      
      if (isBlacklisted) {
        // If server is blacklisted, leave immediately
        console.log(`Left blacklisted server: ${guild.name} (${guild.id})`);
        return await guild.leave();
      }

      // Continue with welcome message and logging if server isn't blacklisted
      let text;
      guild.channels.cache.forEach(c => {
        if (c.type === ChannelType.GuildText && !text) text = c;
      });
      
      if (!text) {
        console.log(`Joined guild ${guild.name} but couldn't find a text channel`);
        return;
      }
      
      const invite = await text.createInvite({ reason: `For ${client.user.tag} Developer(s)`, maxAge: 0 })
        .catch(err => {
          console.error(`Couldn't create invite in ${guild.name}: ${err.message}`);
          return null;
        });
      
      let prefix = client.prefix;
      let links = guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=1024` : null;

      const joinembed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({ name: `Joined a new server!`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Name: **${guild.name}**\nId: **${guild.id}**\nMemberCount: **${guild.memberCount}**\nGuild Joined: **<t:${Math.round(guild.joinedTimestamp / 1000)}:R>**`)
        .addFields([
          { name: '**Owner**', value: `Info: **${(await guild.members.fetch(guild.ownerId).catch(() => null))
            ? guild.members.cache.get(guild.ownerId).user.tag
            : "Unknown User"}**\nGuild Created: **<t:${Math.round(guild.createdTimestamp / 1000)}:R>**` },
          { name: `${client.user.username}'s Server Count`, value: `${client.guilds.cache.size} Servers`},
        ]);
      
      if (invite) {
        joinembed.addFields({ name: 'Invite link', value: `[Here is ${guild.name} invite](https://discord.gg/${invite.code})` });
      }

      if(guild.vanityURLCode) {
        let temp = `https://discord.gg/${guild.vanityURLCode}`;
        joinembed.setURL(temp);
      }
      
      if(links) {
        joinembed.setImage(links);
      }
      
      web.send({ embeds: [joinembed] }).catch(console.error);
      
      const ankush = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({ name: `Thanks for adding ${client.user.username}!`, iconURL: client.user.displayAvatarURL({ dynamic: true })})
        .setDescription(`To get started, join a voice channel and send \`${prefix}play <song name or url>\` to play song.\n・ I come up with different search engines, You may try out me with \`${prefix}play\`\n・ You can use the \`${prefix}help\` command to get list of commands\n・ Feel free to join our [Support Server](https://discord.gg/w77ymEU82a) if you need help/support for anything related to the bot.`)
        .setTimestamp();

      const ankush2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(`https://discord.com/oauth2/authorize?client_id=1234592539324059709&permissions=8&integration_type=0&scope=bot+applications.commands`).setLabel(`Invite`),
        new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(`https://discord.com/invite/w77ymEU82a`).setLabel(`Support Server`)
      );

      const serverChannel = guild.channels.cache.find(
        (channel) =>
          channel.name.includes("logs") ||
          channel.name.includes("log") ||
          channel.name.includes("setup") ||
          channel.name.includes("bot") ||
          channel.name.includes("bot-logs") ||
          channel.name.includes("music") ||
          channel.name.includes("music-logs") ||
          channel.name.includes("music-req") ||
          channel.name.includes("chat") ||
          channel.name.includes("general") ||
          channel.name.includes("welcome") ||
          channel.name.includes("gen") ||
          channel.name.includes("rank") ||
          channel.name.includes("media") ||
          channel.name.includes("pic") ||
          channel.name.includes("meme")
      );

      if (serverChannel) {
        serverChannel.send({ embeds: [ankush], components: [ankush2] }).catch(console.error);
      }
    } catch (error) {
      console.error(`Error in guildCreate event: ${error}`);
    }
  }
};