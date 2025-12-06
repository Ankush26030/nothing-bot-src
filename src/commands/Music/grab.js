const { EmbedBuilder } = require('discord.js');
const { convertTime } = require('../../utils/convert.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'grab',
  category: 'Music',
  description: '',
  aliases: [],
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player.queue.current) {
      let thing = new EmbedBuilder().setColor(client.ankushcolor).setAuthor({
        name: message.author.username || "Unknown User",
        iconURL: message.author.displayAvatarURL( { dynamic : true }),
      }).setDescription('<:x_cross:1250674944057278535> There is no player for this guild, Please connect by using join command.')
      .setTimestamp();
      return message.reply({ embeds: [thing] });
    }

    const msg = await message.channel.send({
      content: "Trying to send...",
    });

    try {
        const song = player.queue.current
        const total = song.duration;
        const current = player.position;
    
            let embed = new EmbedBuilder()
            //.setTitle(`**Grabbed the current playing song!**`)
            .setDescription(`## Grabbed the current playing song!`)
            .addFields([
          { name: '**Title**', value: `[${song.title}](https://discord.com/invite/w77ymEU82a)`, inline: true },
          { name: '**Author**', value: `${song.author}`, inline: true },
          { name: `**Progess**`, value: `${convertTime(current)}/${moment.duration(player.queue.current.length).format("hh:mm:ss")}`, inline: true},
            ])
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
            .setAuthor({ name: `${client.user.username}`, iconURL: message.member.displayAvatarURL({dynamic:true})})
            .setColor(client.ankushcolor)
            .setTimestamp()

      message.author.send({ embeds: [embed] });
      msg.edit({ content: "<:x_tick:1250674883080224768> Message sent successfully.", embeds: [] });
    } catch (error) {
      console.error(error);
      msg.edit({ content: "<:x_cross:1250674944057278535> Couldn't send you a DM. Make sure your DMs are open and try again.", embeds: [] });
    }
  }
};
