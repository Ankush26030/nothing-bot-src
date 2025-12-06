const { EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const { convertTime } = require('../../utils/convert.js');

module.exports = {
  name: 'search',
  aliases: [],
  category: 'Music',
  description: 'Search a song based on your interest!',
  args: false,
  usage: '<song name, song link, artist name>',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    await message.channel.sendTyping();
    const query = args.join(' ');
    
    // Check if query is empty
    if (!query || query.trim() === '') {
      const noQueryEmbed = new EmbedBuilder()
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setColor(client.ankushcolor)
        .setDescription(`<:x_cross:1250674944057278535> Please provide a search query`)
        .setTimestamp();
      
      return message.reply({ embeds: [noQueryEmbed] });
    }
    
    const { channel } = message.member.voice;
    const player = await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel.id,
      textId: message.channel.id,
      deaf: true,
      loadBalancer: true,
    });
    
    const result = await player.search(query, { requester: message.author });

    const queueNumber = player.queue.length;
    const nomatch = new EmbedBuilder()
      .setAuthor({
        name: message.author.username || "Unknown User",
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setColor(client.ankushcolor)
      .setDescription(`<:x_cross:1250674944057278535> No Results Found For \`${query}\``)
      .setTimestamp();

    if (!result.tracks.length) return message.reply({ embeds: [nomatch] });

    try {
      let resultCompoment = await player.search(
        query,
        { engine: "spotify" },
        { requester: message.author }
      );
      
      // If no tracks found, use the original result
      const tracksToUse = resultCompoment.tracks.length > 0 ? resultCompoment.tracks : result.tracks;
      
      const results = tracksToUse.map((track, index) => {
        const truncatedTitle = track.title.length > 100 ? track.title.slice(0, 100) + "..." : track.title;
        return {
          label: `${index + 1}. ${truncatedTitle}`,
          value: track.uri || track.url,
        };
      });

      // Limit to 25 options as Discord has a limit
      const limitedResults = results.slice(0, 25);
      
      const select = new SelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Select a Track to play")
        .addOptions(limitedResults || []);
        
      const replacingoptionifnotfound = new SelectMenuBuilder()
        .setCustomId("select2")
        .setPlaceholder("Select a Track to play")
        .addOptions([
          {
            label: `No Similar Songs Found`,
            value: "no",
          },
        ]);
        
      const embed = new EmbedBuilder()
        .setColor(client.ankushcolor)
        .setAuthor({
          name: `| Select Tracks You Want To Add To The Queue.`,
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      const msg = await message.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(select)],
      });
      
      const filter = (i) => i.user.id === message.author.id;
      const collector = message.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });
      
      collector.on("collect", async (i) => {
        if (i.customId === "select") {
          if (i.values[0] === "no") return;
          if (
            !i.member.voice.channelId &&
            i.user.id !== client.user.id &&
            i.user.id !== client.config.ownerID
          )
            return i.reply({
              content: "<:x_cross:1250674944057278535> You are not in a voice channel!",
              ephemeral: true,
            });
            
          if (
            i.member.voice.channelId !== player.voiceId &&
            i.user.id !== client.config.ownerID
          )
            return i.reply({
              content: `<:x_cross:1250674944057278535> You must be in the same voice channel as the me to use this command!`,
              ephemeral: true,
            });
            
          let track;
          try {
            track = await player.search(i.values[0], { requester: i.user })
              .then((x) => x.tracks[0]);
              
            if (!track) {
              // Try without engine specification if original search fails
              track = await player.search(i.values[0], { engine: "spotify", requester: i.user })
                .then((x) => x.tracks[0]);
            }
          } catch (error) {
            console.error("Error searching track:", error);
            return i.reply({
              content: "<:x_cross:1250674944057278535> Failed to load the track. Please try again.",
              ephemeral: true,
            });
          }
          
          if (!track) return i.reply({
            content: "<:x_cross:1250674944057278535> Track not found. Please try another search.",
            ephemeral: true,
          });
          
          player.queue.add(track);
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
            
          i.update({
            embeds: [
              embed
              .setAuthor({
                name: `| Song Added to Queue #${queueNumber + 1}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_tick:1250674883080224768> [**${track.title}**](https://discord.gg/w77ymEU82a) requested by ${track.requester}`)
            ],
            components: [],
          });
        }
      });
      
      collector.on("end", async (i) => {
        if (i.size === 0) {
          msg.edit({
            embeds: [
              embed
              .setAuthor({
                name: `| Selection was timed out.`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              }),
            ],
            components: [
              new ActionRowBuilder().addComponents(replacingoptionifnotfound),
            ],
          });
        }
      });
    } catch (error) {
      console.error("Error in search command:", error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while searching: ${error.message}`)
        ]
      });
    }
  }
}