const { EmbedBuilder } = require('discord.js');
const db = require('../../utils/database'); // Path to your database.js file

module.exports = {
  name: 'pl-create',
  aliases: ['plcreate', 'create'],
  category: 'Playlist',
  description: "Creates the user's playlist.",
  args: true,
  cooldown: 5,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'], // Fixed the typo here
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  vote: false,
  execute: async (message, args, client, prefix) => {
    const Name = args[0];
    if (!args[0]) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setAuthor({
                  name: message.author.username || "Unknown User",
                  iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`<:x_cross:1250674944057278535> Please specify a playlist name.`)
                .setTimestamp()
            ],
        });
    }
    
    if (Name.length > 20) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> Playlist name can't be greater than 20 characters`)
            .setTimestamp(),
        ],
      });
    }
    
    try {
      // Check if playlist with same name exists
      const existingPlaylist = db.prepare('SELECT * FROM playlists WHERE UserId = ? AND PlaylistName = ?')
        .get(message.author.id, Name);
        
      if (existingPlaylist) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> You already have a playlist with the name **${Name}**`)
              .setTimestamp(),
          ],
        });
      }
      
      // Count user's playlists
      const userPlaylistCount = db.prepare('SELECT COUNT(*) as count FROM playlists WHERE UserId = ?')
        .get(message.author.id);
        
      if (userPlaylistCount.count >= 10) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(client.ankushcolor)
              .setAuthor({
                name: message.author.username || "Unknown User",
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
              })
              .setDescription(`<:x_cross:1250674944057278535> You can only create **10** playlists`)
              .setTimestamp(),
          ],
        });
      }
      
      // Insert new playlist
      const insert = db.prepare('INSERT INTO playlists (UserName, UserId, PlaylistName, CreatedOn) VALUES (?, ?, ?, ?)');
      insert.run(
        message.author.tag,
        message.author.id,
        Name,
        Math.round(Date.now() / 1000)
      );
      
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.username || "Unknown User",
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`<:x_tick:1250674883080224768> Successfully created a playlist for you named **${Name}**`)
        .setTimestamp()
        .setColor(client.ankushcolor);
        
      return message.channel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.ankushcolor)
            .setAuthor({
              name: message.author.username || "Unknown User",
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`<:x_cross:1250674944057278535> An error occurred while creating your playlist.`)
            .setTimestamp(),
        ],
      });
    }
  },
};