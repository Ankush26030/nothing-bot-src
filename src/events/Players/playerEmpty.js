const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db2 = require("../../models/autoreconnect");
const { autoplay } = require("../../utils/functions");
const { REST } = require("@discordjs/rest");

module.exports = {
  name: 'playerEmpty',
  run: async (client, player, message) => {
    try {
      // Clean up previous message if it exists
      if (player.data.get('message') && player.data.get('message').deletable) {
        await player.data.get('message').delete().catch(() => null);
      }

      // Update voice status
      const voiceId = player.voiceId;
      const status = `;`;
      const rest = new REST({ version: '10' }).setToken(client.config.token);
      await rest.put(`/channels/${voiceId}/voice-status`, {
        body: {
          status: status
        }
      });

      // Handle autoplay if enabled
      if (player.data.get("autoplay")) {
        player.previous = player.data.get("autoplaySystem");
        return autoplay(player, client);
      }

      // Get guild information
      let guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;

      // Create the embed and buttons
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setTitle('Queue Ended')
        .setDescription('No more songs in the queue. You can add more songs or invite me to your server!')
        .setTimestamp();

      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Admin Perms")
            .setURL(
              `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=37088600&scope=bot%20applications.commands`
            ),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Require Perms")
            .setURL(
              `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=37080065&scope=bot`
            )
        );

      // Check for 24/7 mode
      const TwoFourSeven = await db2.findOne({ where: { Guild: guild.id } });
      
      if (TwoFourSeven) {
        // If 24/7 mode is enabled
        embed
          .setTitle('Queue Empty - 24/7 Mode Active')
          .setDescription('The queue is currently empty, but I\'ll stay in the voice channel since 24/7 mode is enabled.');
      } else {
        // If 24/7 mode is disabled
        embed
          .setTitle('Queue Empty - Disconnecting')
          .setDescription('The queue has ended. I\'ll be disconnecting from the voice channel.');
        
        // Destroy the player since 24/7 mode is not enabled
        await player.destroy();
      }

      // Send the message and delete after 10 seconds
      await client.channels.cache.get(player.textId)?.send({
        embeds: [embed],
        components: [buttons]
      }).then(msg => {
        setTimeout(() => {
          msg.delete().catch(() => null);
        }, 10000);
      });

    } catch (error) {
      console.error('Error in playerEmpty event:', error);
    }
  },
};