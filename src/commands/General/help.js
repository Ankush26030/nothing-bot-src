const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'help',
  category: 'General',
  aliases: ['helpp', 'h'],
  cooldown: 5,
  description: 'Help with all commands, or one specific command.',
  args: false,
  botPrams: [],
  owner: false,
  execute: async (message, args, client, prefix) => {
    if (!args[0]) {
      const ankush = await client.users.fetch("829008198232178699");

      let helpmenu = new EmbedBuilder()
        .setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Developed With ❤️ By The Ankush`,
          iconURL: ankush.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`**Hey!!** <@${message.author.id}>, I am <@${client.user.id}>\n**Help Menu:**\n~ My default prefix is: ${prefix}\n~ Total Commands: \`${client.commands.size}\` |\n~ Usable By You \`96\``)
        .setFields([
          { name: `Help Related to Nothing Commands:`, value: `>>> <:Home:1293196346060181546> **: General**\n<:Music:1293196450284437504> **: Music**\n<:Filter:1293196502369570857> **: Filters**\n<:Playlist:1293199715328069695> **: Playlist**\n<:Setting:1293196668245905438> **: Settings**\n<:Source:1293196715624759399> **: Sources**\n<:Spotify:1342162844258406473> **: Spotify**\n<:Favourite:1351113884940898354> **: Favourite**`, inline: false },
          { name: `~ Select A Category From Below`, value: `~ [Invite Nothing](https://discord.com/oauth2/authorize?client_id=1234592539324059709&permissions=8&integration_type=0&scope=bot+applications.commands) | [Support Server](https://discord.com/invite/w77ymEU82a)`, inline: false }
        ])
        .setColor(client.ankushcolor);

      const row1 = new ActionRowBuilder()
        .addComponents(
          new SelectMenuBuilder()
            .setCustomId('helpop')
            .setPlaceholder('❯ SELECT A CATEGORY')
            .addOptions([
              {
                label: `Home`,
                description: 'Get Home Page',
                emoji: `<:Home:1293196346060181546>`,
                value: `h1`,
              },
              {
                label: 'General',
                description: 'View general commands',
                value: 'h2',
                emoji: `<:Home:1293196346060181546>`,
              },
              {
                label: 'Music',
                description: 'View music commands',
                value: 'h3',
                emoji: `<:Music:1293196450284437504>`,
              },
              {
                label: 'Filters',
                description: 'View filters commands',
                value: 'h4',
                emoji: `<:Filter:1293196502369570857>`,
              },
              {
                label: 'Playlist',
                description: 'View playlist commands',
                value: 'h5',
                emoji: `<:Playlist:1293199715328069695>`,
              },
              {
                label: 'Settings',
                description: 'View settings commands',
                value: 'h6',
                emoji: `<:Setting:1293196668245905438>`,
              },
              {
                label: 'Sources',
                description: 'View sources commands',
                value: 'h7',
                emoji: `<:Source:1293196715624759399>`,
              },
              {
                label: 'Spotify',
                description: 'View Spotify commands',
                value: 'h8',
                emoji: `<:Spotify:1342162844258406473>`,
              },
              {
                label: 'Favourite',
                description: 'View favourite commands',
                value: 'h9',
                emoji: `<:Favourite:1351113884940898354>`,
              },
              {
                label: 'All Commands',
                description: 'View all commands',
                value: 'h10',
                emoji: `<:Commands:1351134190048903209>`,
              }
            ])
        );

      // Create buttons for Invite and Support Server
      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Invite Me')
            .setURL('https://discord.com/oauth2/authorize?client_id=1234592539324059709&permissions=8&integration_type=0&scope=bot+applications.commands')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.com/invite/w77ymEU82a')
            .setStyle(ButtonStyle.Link)
        );

      const msg = await message.channel.send({ embeds: [helpmenu], components: [row1, row2] });

      let embed1 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`bio\`**, **\`help\`**, **\`report\`**, **\`invite\`**, **\`ping\`**, **\`uptime\`**, **\`profile\`**, **\`stats\`**, **\`vote\`**, **\`checkvote\`**, **\`support\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- General Commands`).setTimestamp();
      let embed2 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`247\`**, **\`autoplay\`**, **\`clearqueue\`**, **\`join\`**, **\`leave\`**, **\`forceskip\`**, **\`seek\`**, **\`grab\`**, **\`loop\`**, **\`move\`**, **\`nowplaying\`**, **\`pause\`**, **\`play\`**, **\`queue\`**, **\`remove\`**, **\`removedupes\`**, **\`replay\`**, **\`resume\`**, **\`rewind\`**, **\`search\`**, **\`shuffle\`**, **\`skip\`**, **\`skipto\`**, **\`stop\`**, **\`volume\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Music Commands`).setTimestamp();
      let embed3 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`pl-add\`**, **\`pl-addnowplaying\`**, **\`pl-addqueue\`**, **\`pl-create\`**, **\`pl-delete\`**, **\`pl-dupes\`**, **\`pl-info\`**, **\`pl-list\`**, **\`pl-load\`**, **\`pl-remove\`**`).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Playlist Commands`).setTimestamp().setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
      let embed4 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`8d\`**, **\`bass\`**, **\`clearfilters\`**, **\`dance\`**, **\`earrape\`**, **\`electronic\`**, **\`lofi\`**, **\`nightcore\`**, **\`party\`**, **\`pop\`**, **\`radio\`**, **\`rock\`**, **\`slowreverb\`**, **\`treblebass\`**, **\`vaporwave\`**, **\`darthvader\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Filters Commands`).setTimestamp();
      let embed5 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`afk\`**, **\`prefix\`**, **\`ignorechannel\`**, **\`ownerinfo\`**, **\`avatar\`**, **\`banner\`**, **\`partner\`**, **\`moveme\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Settings Commands`).setTimestamp();
      let embed7 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`sources\`**, **\`src-soundcloud\`**, **\`src-spotify\`**, **\`src-youtube\`**, **\`src-jiosaavn\`**, **\`src-deezer\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Sources Commands`).setTimestamp();
      let embed8 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`spotify login\`**, **\`spotify profile\`**, **\`spotify playlist\`**, **\`searchplaylist\`**, **\`spotify logout\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Spotify Commands`).setTimestamp();
      let embed9 = new EmbedBuilder().setColor(client.ankushcolor).setDescription(`**\`like\`**, **\`playliked\`**, **\`clearlikes\`**, **\`showliked\`**`).setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(client.user.displayAvatarURL({ dynamic: true })).setTitle(`- Favourite Commands`).setTimestamp();

      // Create an embed that lists all commands
      let allCommandsEmbed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setTitle(`${client.user.username} - All Commands`)
        .setDescription(
          `**__General Commands__:**\n${embed1.data.description}\n\n` +
          `**__Music Commands__:**\n${embed2.data.description}\n\n` +
          `**__Playlist Commands__:**\n${embed3.data.description}\n\n` +
          `**__Filters Commands__:**\n${embed4.data.description}\n\n` +
          `**__Settings Commands__:**\n${embed5.data.description}\n\n` +
          `**__Sources Commands__:**\n${embed7.data.description}\n\n` +
          `**__Spotify Commands__:**\n${embed8.data.description}\n\n` +
          `**__Favourite Commands__:**\n${embed9.data.description}`
        )
        .setAuthor({ name: `${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      const collector = await msg.createMessageComponentCollector({
        filter: (interaction) => {
          if (message.author.id === interaction.user.id) return true;
          else {
            interaction.reply({ content: `<:x_cross:1250674944057278535> Only ${message.author.tag} can use this button!`, ephemeral: true });
          }
        },
        time: 1000000,
        idle: 1000000 / 2
      });

      collector.on('collect', async (interaction) => {
        if (interaction.isSelectMenu()) {
          for (const value of interaction.values) {
            if (value === `h1`) {
              return interaction.update({ embeds: [helpmenu], components: [row1, row2] });
            }
            if (value === `h2`) {
              return interaction.update({ embeds: [embed1], components: [row1, row2] });
            }
            if (value === `h3`) {
              return interaction.update({ embeds: [embed2], components: [row1, row2] });
            }
            if (value === `h4`) {
              return interaction.update({ embeds: [embed4], components: [row1, row2] });
            }
            if (value === `h5`) {
              return interaction.update({ embeds: [embed3], components: [row1, row2] });
            }
            if (value === `h6`) {
              return interaction.update({ embeds: [embed5], components: [row1, row2] });
            }
            if (value === `h7`) {
              return interaction.update({ embeds: [embed7], components: [row1, row2] });
            }
            if (value === `h8`) {
              return interaction.update({ embeds: [embed8], components: [row1, row2] });
            }
            if (value === `h9`) {
              return interaction.update({ embeds: [embed9], components: [row1, row2] });
            }
            if (value === `h10`) {
              return interaction.update({ embeds: [allCommandsEmbed], components: [row1, row2] });
            }
          }
        }
      });

      collector.on('end', async () => {
        msg.edit({ content: ``, embeds: [helpmenu], components: [] });
      });
    }
  }
};