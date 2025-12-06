const { EmbedBuilder } = require('discord.js');
const Wait = require('util').promisify(setTimeout);

module.exports = {
  name: 'stop',
  category: 'Music',
  description: 'Stops the music',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player.queue.current) {
      let embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setDescription('No song is currently playing in this guild.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Clear the queue and reset the player
    player.queue.clear();
    player.data.delete("autoplay");
    player.loop = 'none';
    player.playing = false;
    player.paused = false;
    await player.skip();

    // Wait for the skip to finish
    await Wait(500);

    // Send a confirmation message
    let embed = new EmbedBuilder()
      .setColor(client.ankushcolor)
      .setDescription('The music has been stopped and the queue cleared.')
      .setTimestamp();
    message.reply({ embeds: [embed] });
  },
};
