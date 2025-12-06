const { EmbedBuilder } = require("discord.js");
const os = require('os');
const process = require('process');
const { hasVotePermission } = require('../../utils/voteCheck');

module.exports = {
  name: 'stats',
  category: 'General',
  aliases: ['st', 'status', 'botinfo'],
  cooldown: 5,
  description: 'Displays comprehensive bot statistics including system resources, performance metrics, and version information.',
  args: false,
  usage: '',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      // Check if user has voted
      const hasVoted = await hasVotePermission(message.author.id, client);
      if (!hasVoted) {
        return message.reply("This command requires you to vote for the bot! Use the `vote` command to learn more.");
      }
      
      // Calculate various stats
      const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
      
      const uptimeTimestamp = Math.floor((Date.now() - client.uptime) / 1000);
      const serverCount = client.guilds.cache.size;
      const channelCount = client.channels.cache.size;
      
      // Calculate memory usage
      const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2); // Convert to GB
      const memoryPercentage = ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1);

      // Get CPU info safely
      const cpus = os.cpus();
      const cpuModel = cpus && cpus.length > 0 ? cpus[0].model.trim() : 'Unknown CPU';
      const cpuCores = cpus ? cpus.length : 0;
      
      // Get Discord.js version safely
      let discordJSVersion = 'Unknown';
      try {
        discordJSVersion = require("discord.js").version;
      } catch (e) {
        console.error('Could not get Discord.js version:', e);
      }
      
      // Create embed with modern styling
      const embed = new EmbedBuilder()
        .setColor(client.config?.embedColor || '#ff0000')
        .setAuthor({
          name: `${client.user.username} Statistics`,
          iconURL: client.user.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription(`[**Support Server**](https://discord.com/invite/w77ymEU82a)`)
        .addFields([
          {
            name: '__Bot Statistics__',
            value: [
              `<a:red_dot:1330454614067380275> Users: \`${totalMembers.toLocaleString()}\``,
              `<a:red_dot:1330454614067380275> Servers: \`${serverCount.toLocaleString()}\``,
              `<a:red_dot:1330454614067380275> Commands: \`${client.commands.size}\``,
              // `<a:red_dot:1330454614067380275> Channels: \`${channelCount.toLocaleString()}\``,
              `<a:red_dot:1330454614067380275> Uptime: <t:${uptimeTimestamp}:R>`
            ].join('\n'),
            inline: false
          },
          {
            name: '__System Information__',
            value: [
              `<a:red_dot:1330454614067380275> CPU: \`${cpuModel}\``,
              `<a:red_dot:1330454614067380275> CPU Cores: \`${cpuCores}\``,
              `<a:red_dot:1330454614067380275> Memory: \`${usedMemory}MB / ${totalMemory}GB (${memoryPercentage}%)\``,
              `<a:red_dot:1330454614067380275> Platform: \`${os.platform()} ${os.arch()}\``
            ].join('\n'),
            inline: false
          },
          {
            name: '__Technical Details__',
            value: [
              `<a:red_dot:1330454614067380275> API Latency: \`${client.ws.ping}ms\``,
              `<a:red_dot:1330454614067380275> Node.js: \`${process.version}\``,
              `<a:red_dot:1330454614067380275> Discord.js: \`v${discordJSVersion}\``
            ].join('\n'),
            inline: false
          }
        ])
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
        })
        .setTimestamp();

      // Add support server link if configured
      if (client.config?.supportServer) {
        embed.addFields({
          name: '__Links__',
          value: `[**Support Server**](${client.config.supportServer})`,
          inline: false
        });
      }

      await message.reply({ embeds: [embed] }).catch(err => {
        console.error('Error sending embed:', err);
        message.channel.send('Failed to display statistics. Please check bot permissions.').catch(() => {});
      });
    } catch (error) {
      console.error('Error in stats command:', error);
      await message.reply('An error occurred while fetching bot statistics. Please try again later.').catch(() => {});
    }
  }
};