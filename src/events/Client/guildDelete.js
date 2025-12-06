const { EmbedBuilder, ChannelType, WebhookClient } = require('discord.js');
const moment = require('moment');
const web = new WebhookClient({url : `https://discord.com/api/webhooks/1365059785736720514/GyUfXhkPs_eEhd-a2wZBeVYCTcNo7XKhH0EF3VGZ1amyaP7qvVZhOhCvhpS_pXn3BlWy`});

module.exports = {
  name: "guildDelete",
  run: async (client, guild) => {
    // Skip guild leave events during startup
    if (!global.isReady) {
      console.log(`Ignoring guild leave event for ${guild.id} during startup`);
      return;
    }
    
    // Rest of your code remains the same...
    let emoji;
    // Safe checks to avoid TypeError when properties are undefined
    const hasFeatures = guild && guild.features;
    const isPartnered = hasFeatures && guild.features.includes('PARTNERED');
    const isVerified = hasFeatures && guild.features.includes('VERIFIED');
    
    let links = guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=1024` : null;
    
    if(isPartnered && isVerified)
      emoji = `<:Partner:1315773559775428649><:verified:1286994555702345784>`;
    else if(isPartnered && !isVerified)
      emoji = "<:Partner:1315773559775428649>";
    else if(!isPartnered && isVerified)
      emoji = "<:verified:1286994555702345784>";
    else
      emoji = "<:cross:1277611886820593780>";
      
    const ankush = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setAuthor({ name: `Server left..!`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`Name: **${guild.name}**\nId: **${guild.id}**\nDiscord Level: ${emoji}\nMemberCount: **${guild.memberCount}**\nGuild Joined: **<t:${Math.round(guild.joinedTimestamp / 1000)}:R>**`)
      .addFields([
        { name: `${client.user.username}'s Server Count`, value: `${client.guilds.cache.size} Servers`},
      ])
    
    if(guild.banner)
      ankush.setImage(links)
      
    web.send({ embeds: [ankush]})
  }
};