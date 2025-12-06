const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'play',
  category: 'Music',
  aliases: ['p'],
  description: 'Plays songs from different platforms.',
  args: false,
  cooldown: 3,
  usage: '[song name or song link]',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    try {
      if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve(["Speak", "Connect"]))) {
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription("I don't have the necessary permissions to connect or speak in the voice channel.");
        return message.reply({ embeds: [embed] });
      }
      
      const { channel } = message.member.voice;
      if (!channel) {
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription("You need to be in a voice channel to use this command.");
        return message.reply({ embeds: [embed] });
      }
      
      if (!message.guild.members.cache
        .get(client.user.id)
        .permissionsIn(channel)
        .has(PermissionsBitField.resolve(["Speak", "Connect"]))) {
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription("I don't have permission to join and speak in your voice channel.");
        return message.reply({ embeds: [embed] });
      }
      
      const query = args.join(' ');
      if (!query) {
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription("Please provide a song name or link to play.");
        return message.reply({ embeds: [embed] });
      }
      
      // Check if manager exists
      if (!client.manager) {
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription("Music manager is not properly initialized. Please contact the bot developer.");
        return message.reply({ embeds: [embed] });
      }
      
      // Create player with error handling
      let player;
      try {
        player = await client.manager.createPlayer({
          guildId: message.guild.id,
          voiceId: message.member.voice.channel.id,
          textId: message.channel.id,
          shardId: message.guild.shardId || 0,
          loadBalancer: true,
          deaf: true,
        });
      } catch (error) {
        console.error("Error creating player:", error);
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription(`Failed to create music player: ${error.message}`);
        return message.reply({ embeds: [embed] });
      }
      
      // Search with error handling
      let result;
      try {
        result = await player.search(query, { requester: message.author });
        
        if (!result || !result.tracks || !result.tracks.length) {
          const embed = new EmbedBuilder()
            .setColor(client.ankushcolor || '#FF0000')
            .setDescription("No results found for your query.");
          return message.reply({ embeds: [embed] });
        }
      } catch (error) {
        console.error("Error searching for tracks:", error);
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setDescription(`Error searching for tracks: ${error.message}`);
        return message.reply({ embeds: [embed] });
      }
      
      const MIN_DURATION = 30000;
      let addedTrackCount = 0;
      
      if (result.type === 'PLAYLIST') {
        const validTracks = result.tracks.filter(track => track.isStream || track.length >= MIN_DURATION);
        
        if (!validTracks.length) {
          const embed = new EmbedBuilder()
            .setColor(client.ankushcolor || '#FF0000')
            .setDescription("No songs in the playlist are streams or longer than 30 seconds.");
          return message.reply({ embeds: [embed] });
        }
        
        for (const track of validTracks) {
          player.queue.add(track);
          addedTrackCount++;
        }
        
        const playlistName = result.playlist && result.playlist.name ? result.playlist.name : "Unknown Playlist";
        
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setTitle('Playlist Added to Queue')
          .setDescription(`**${playlistName}** with ${addedTrackCount} valid track(s) has been added to the queue.`)
          .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
        
        if (!player.playing && !player.paused) {
          try {
            await player.play();
          } catch (error) {
            console.error("Error starting playback:", error);
          }
        }
        
        return message.reply({ embeds: [embed] });
      } else {
        const track = result.tracks[0];
        
        if (!track.isStream && track.length < MIN_DURATION) {
          const embed = new EmbedBuilder()
            .setColor(client.ankushcolor || '#FF0000')
            .setDescription("This track is shorter than 30 seconds and cannot be added to the queue.");
          return message.reply({ embeds: [embed] });
        }
        
        player.queue.add(track);
        
        const embed = new EmbedBuilder()
          .setColor(client.ankushcolor || '#FF0000')
          .setTitle('Track Added to Queue')
          .setDescription(`**[${track.title}](${track.uri})** by ${track.author} has been added to the queue.`)
          .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
        
        if (!player.playing && !player.paused) {
          try {
            await player.play();
          } catch (error) {
            console.error("Error starting playback:", error);
          }
        }
        
        return message.reply({ embeds: [embed] });
      }
    } catch (mainError) {
      console.error("Main error in play command:", mainError);
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor || '#FF0000')
        .setDescription(`An error occurred: ${mainError.message}`);
      return message.reply({ embeds: [embed] });
    }
  },
};