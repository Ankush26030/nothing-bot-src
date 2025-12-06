const axios = require("axios");
const SpotifyProfile = require("../../schema/spotifyProfile");

const {
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

let accessToken = null;
let tokenExpiresAt = 0;

// Function to get a new Spotify Access Token
const getAccessToken = async () => {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`e6f84fbec2b44a77bf35a20c5ffa54b8:498f461b962443cfaf9539c610e2ea81`).toString("base64"),
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    return accessToken;
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

// Extract User ID from Spotify Profile URL
const extractUserId = (url) => {
  const match = url.match(/user\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

// Fetch Spotify User Profile
const fetchSpotifyProfile = async (spotifyUrl) => {
  const userId = extractUserId(spotifyUrl);
  if (!userId) {
    console.error("Invalid Spotify URL");
    return null;
  }

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching Spotify profile:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

const fetchPlaylistDetails = async (playlistId) => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching playlist details:', error.response ? error.response.data : error.message);
        return null;
    }
};

// Fetch User Playlists
const fetchUserPlaylists = async (spotifyUrl) => {
  const userId = extractUserId(spotifyUrl);
  if (!userId) {
    console.error("Invalid Spotify URL");
    return null;
  }

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.items;
  } catch (error) {
    console.error(
      "Error fetching user playlists:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

// Search Spotify Playlists
const searchSpotifyPlaylists = async (query) => {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.playlists.items;
  } catch (error) {
    console.error(
      "Error searching Spotify playlists:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

// Safe message edit function with error handling
const safeMessageEdit = async (message, content) => {
  try {
    // Check if message exists and is still available
    if (message && !message.deleted) {
      await message.edit(content);
    }
  } catch (error) {
    // Silently handle the error - message likely deleted or inaccessible
    console.log(`Message edit failed: ${error.message}`);
  }
};

module.exports = {
    name: 'spotify',
    aliases: ['sp'],
    category: 'Spotify',
    description: 'Spotify.',
    args: false,
    usage: '',
    cooldown: 5,
    userPrams: [],
    botPrams: ['EmbedLinks'],
    owner: false,
    player: false,
    dj: false,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    vote: false,
    execute: async (message, args, client, prefix) => {
    // Define a default embed color in case client.embedColor is undefined
    const embedColor = client.embedColor || "#1DB954";
    
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(embedColor)
            .setDescription("Available Spotify commands: `login`, `profile`, `playlist`, `searchplaylist`, `logout`"),
        ],
      });
    }

    // Spotify Login
    if (args[0].toLowerCase() === "login") {
      if (!args[1]) {
        return message.reply("Please provide your Spotify profile URL.");
      }

      const url = args[1];
      if (!url.startsWith("https://open.spotify.com/user/")) {
        return message.reply("Invalid Spotify profile URL!");
      }

      const existingProfile = await SpotifyProfile.findOne({ userId: message.author.id });
      if (existingProfile) {
        return message.reply("⚠️ You are already logged in with Spotify!");
      }

      const profileData = await fetchSpotifyProfile(url);
      if (!profileData) {
        return message.reply("Failed to fetch Spotify profile.");
      }

      await SpotifyProfile.findOneAndUpdate(
        { userId: message.author.id },
        {
          profileId: profileData.id,
          username: profileData.display_name,
          profileUrl: profileData.external_urls.spotify,
          followers: profileData.followers.total,
          totalPlaylists: 0,
        },
        { upsert: true }
      );

      return message.reply("Spotify profile linked successfully!");
    }

    // Spotify Profile
    if (args[0].toLowerCase() === "profile") {
      const userProfile = await SpotifyProfile.findOne({ userId: message.author.id });
      if (!userProfile) {
        return message.reply("You haven't linked a Spotify profile. Use `spotify login <profile_url>` first.");
      }

      const profileData = await fetchSpotifyProfile(userProfile.profileUrl);
      if (!profileData) {
        return message.reply("Failed to fetch profile details.");
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `${message.author.username}`,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(profileData.images[0]?.url || null)
            .setDescription(
              `- Username: **${userProfile.username}**\n` +
                `- User ID: **${userProfile.profileId}**\n` +
                `- Total Playlists: **${userProfile.totalPlaylists}**\n` +
                `- Followers: **${userProfile.followers}**`
            )
            .setColor("#1DB954"),
        ],
      });
    }

      
    // Spotify Playlist
    if (args[0].toLowerCase() === "playlist") {
      const userProfile = await SpotifyProfile.findOne({ userId: message.author.id });
      if (!userProfile) {
        return message.reply("You haven't linked a Spotify profile. Use `spotify login <profile_url>` first.");
      }

      const playlists = await fetchUserPlaylists(userProfile.profileUrl);
      if (!playlists || playlists.length === 0) {
        return message.reply("You don't have any public playlists.");
      }

      const menu = new StringSelectMenuBuilder()
        .setCustomId("playlist_select")
        .setPlaceholder("Choose a playlist")
        .addOptions(playlists.map(p => ({ label: p.name, value: p.id })));

      const row = new ActionRowBuilder().addComponents(menu);

      const playlistMessage = await message.reply({
        content: "Select a playlist from the dropdown below:",
        components: [row]
      });

      // Store the message ID for reference checks
      const messageId = playlistMessage.id;

      // Collector for Playlist Selection
      const collector = playlistMessage.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 300000, // 5 minutes instead of 1000000
      });

      collector.on("collect", async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === "playlist_select") {
          const selectedPlaylistId = interaction.values[0];
          const playlistDetails = await fetchPlaylistDetails(selectedPlaylistId);

          if (!playlistDetails) {
            return interaction.reply({ content: "Failed to fetch playlist details.", ephemeral: true });
          }

          // Initial Embed (without track details)
          const embed = new EmbedBuilder()
            .setTitle(playlistDetails.name)
            .setURL(playlistDetails.external_urls.spotify)
            .setThumbnail(playlistDetails.images[0]?.url || null)
            .setDescription(`**Total Tracks:** ${playlistDetails.tracks.total}\n**Owner:** ${playlistDetails.owner.display_name}`)
            .setColor("#1DB954");

          // Create action menu dropdown instead of buttons
          const actionMenu = new StringSelectMenuBuilder()
            .setCustomId(`action_${selectedPlaylistId}`)
            .setPlaceholder("Select an action")
            .addOptions([
              {
                label: "Play Playlist",
                description: "Play this playlist in your voice channel",
                value: `play_${selectedPlaylistId}`,
                emoji: "▶️"
              },
              {
                label: "See Tracks",
                description: "View the top tracks in this playlist",
                value: `see_${selectedPlaylistId}`,
                emoji: "📋"
              }
            ]);

          const actionRow = new ActionRowBuilder().addComponents(actionMenu);

          await interaction.update({ embeds: [embed], components: [actionRow] });
          
          // Create a new collector for the action menu with the same timeout
          const actionCollector = playlistMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 300000, // 5 minutes
          });

          actionCollector.on("collect", async (actionInteraction) => {
            if (actionInteraction.isStringSelectMenu() && actionInteraction.customId.startsWith("action_")) {
              const [action, playlistId] = actionInteraction.values[0].split("_");

              if (action === "play") {
                const { channel } = message.member.voice;
                if (!message.member.voice.channelId) {
                  return actionInteraction.reply({
                    content: "**You are not in a voice channel!**",
                    ephemeral: true,
                  });
                }

                let player = client.manager.players.get(message.guild.id);
                if (!player) {
                  player = await client.manager.createPlayer({
                    guildId: message.guild.id,
                    textId: message.channel.id,
                    voiceId: channel.id,
                    volume: 100,
                    deaf: true,
                    shardId: message.guild.shardId,
                  });
                }

                const query = `https://open.spotify.com/playlist/${playlistId}`;
                const result = await client.manager.search(query, { requester: message.author });

                if (!result.tracks.length)
                  return actionInteraction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setDescription("No results found!")
                        .setColor("#1DB954"),
                    ],
                  });

                // Add tracks to queue
                if (result.type === "PLAYLIST") {
                  result.tracks.forEach((track) => player.queue.add(track));
                } else {
                  player.queue.add(result.tracks[0]);
                }

                // Play if not playing
                if (!player.playing && !player.paused) player.play();

                await actionInteraction.reply(`Playing **${playlistDetails.name}** in your voice channel...`);
              } else if (action === "see") {
                const playlistDetails = await fetchPlaylistDetails(playlistId);
                if (!playlistDetails) {
                  return actionInteraction.reply({ content: "Failed to fetch playlist details.", ephemeral: true });
                }

                const trackList = playlistDetails.tracks.items.slice(0, 10).map((t, index) =>
                  `**${index + 1}.** ${t.track.name} - ${t.track.artists.map(a => a.name).join(", ")}`
                ).join("\n");

                // Update the Embed with Track Info
                const updatedEmbed = new EmbedBuilder()
                  .setTitle(playlistDetails.name)
                  .setURL(playlistDetails.external_urls.spotify)
                  .setThumbnail(playlistDetails.images[0]?.url || null)
                  .setDescription(`**Total Tracks:** ${playlistDetails.tracks.total}\n**Owner:** ${playlistDetails.owner.display_name}\n\n**Top Tracks:**\n${trackList}`)
                  .setColor("#1DB954");

                // Create a new action menu with "Play" option only
                const updatedActionMenu = new StringSelectMenuBuilder()
                  .setCustomId(`action_${selectedPlaylistId}`)
                  .setPlaceholder("Select an action")
                  .addOptions([
                    {
                      label: "Play Playlist",
                      description: "Play this playlist in your voice channel",
                      value: `play_${playlistId}`,
                      emoji: "▶️"
                    }
                  ]);
                  
                const updatedActionRow = new ActionRowBuilder().addComponents(updatedActionMenu);
                await actionInteraction.update({ embeds: [updatedEmbed], components: [updatedActionRow] });
              }
            }
          });

          // Safe timeout handler for disabling the menu
          collector.on("end", async (collected, reason) => {
            try {
              await safeMessageEdit(playlistMessage, { 
                components: [],
                content: "This menu has expired. Please run the command again to interact with playlists." 
              });
            } catch (error) {
              console.error("Failed to disable menu:", error);
            }
          });
        }
      });
    }
      
    // Search Spotify Playlists
    if (args[0].toLowerCase() === "searchplaylist") {
      if (!args[1]) {
        return message.reply("Please provide a search term for playlists.");
      }

      const searchQuery = args.slice(1).join(" ");
      const loadingMessage = await message.reply("🔍 Searching for playlists...");

      const searchResults = await searchSpotifyPlaylists(searchQuery);
      if (!searchResults || searchResults.length === 0) {
        return safeMessageEdit(loadingMessage, "No playlists found for your search query.");
      }

      // Create a select menu with the search results
      const menu = new StringSelectMenuBuilder()
        .setCustomId("search_playlist_select")
        .setPlaceholder("Choose a playlist")
        .addOptions(
          searchResults
            .filter(playlist => playlist && playlist.name && playlist.owner && playlist.tracks)
            .map((playlist, index) => ({
              label: playlist.name.length > 25 ? playlist.name.substring(0, 22) + "..." : playlist.name,
              description: `By ${playlist.owner.display_name} (${playlist.tracks.total} tracks)`.substring(0, 50),
              value: playlist.id,
            }))
        );

      const row = new ActionRowBuilder().addComponents(menu);

      await safeMessageEdit(loadingMessage, {
        content: `Found ${searchResults.length} playlists for "${searchQuery}":`,
        components: [row],
      });

      // Collector for Playlist Selection with reasonable timeout
      const collector = loadingMessage.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 60000, // 1 minute
      });

      collector.on("collect", async (interaction) => {
        if (interaction.isStringSelectMenu() && interaction.customId === "search_playlist_select") {
          const selectedPlaylistId = interaction.values[0];
          const playlistDetails = await fetchPlaylistDetails(selectedPlaylistId);

          if (!playlistDetails) {
            return interaction.reply({ content: "Failed to fetch playlist details.", ephemeral: true });
          }

          // Initial Embed (without track details)
          const embed = new EmbedBuilder()
            .setTitle(playlistDetails.name)
            .setURL(playlistDetails.external_urls.spotify)
            .setThumbnail(playlistDetails.images[0]?.url || null)
            .setDescription(
              `**Total Tracks:** ${playlistDetails.tracks.total}\n` +
              `**Owner:** ${playlistDetails.owner.display_name}\n` +
              `**Followers:** ${playlistDetails.followers.total.toLocaleString()}\n` +
              `**Description:** ${playlistDetails.description || "No description"}`
            )
            .setColor("#1DB954");

          // Create action menu dropdown instead of buttons
          const actionMenu = new StringSelectMenuBuilder()
            .setCustomId(`search_action_${selectedPlaylistId}`)
            .setPlaceholder("Select an action")
            .addOptions([
              {
                label: "Play Playlist",
                description: "Play this playlist in your voice channel",
                value: `play_${selectedPlaylistId}`,
                emoji: "▶️"
              },
              {
                label: "See Tracks",
                description: "View the top tracks in this playlist",
                value: `see_${selectedPlaylistId}`,
                emoji: "📋"
              }
            ]);

          const actionRow = new ActionRowBuilder().addComponents(actionMenu);

          await interaction.update({ embeds: [embed], components: [actionRow] });

          // Create a new collector for the action menu
          const actionCollector = loadingMessage.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 60000, // 1 minute
          });

          actionCollector.on("collect", async (actionInteraction) => {
            if (actionInteraction.isStringSelectMenu() && actionInteraction.customId.startsWith("search_action_")) {
              const [action, playlistId] = actionInteraction.values[0].split("_");

              if (action === "play") {
                const { channel } = message.member.voice;
                if (!message.member.voice.channelId) {
                  return actionInteraction.reply({
                    content: "**You are not in a voice channel!**",
                    ephemeral: true,
                  });
                }

                let player = client.manager.players.get(message.guild.id);
                if (!player) {
                  player = await client.manager.createPlayer({
                    guildId: message.guild.id,
                    textId: message.channel.id,
                    voiceId: channel.id,
                    volume: 100,
                    deaf: true,
                    shardId: message.guild.shardId,
                  });
                }

                const query = `https://open.spotify.com/playlist/${playlistId}`;
                const result = await client.manager.search(query, { requester: message.author });

                if (!result.tracks.length) {
                  return actionInteraction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setDescription("No tracks found in this playlist!")
                        .setColor("#1DB954"),
                    ],
                    ephemeral: true,
                  });
                }

                // Add tracks to queue
                if (result.type === "PLAYLIST") {
                  result.tracks.forEach((track) => player.queue.add(track));
                } else {
                  player.queue.add(result.tracks[0]);
                }

                // Play if not playing
                if (!player.playing && !player.paused) player.play();

                await actionInteraction.reply({
                  content: `Playing **${playlistDetails.name}** in your voice channel...`,
                  ephemeral: false,
                });
              } else if (action === "see") {
                const playlistDetails = await fetchPlaylistDetails(playlistId);
                if (!playlistDetails) {
                  return actionInteraction.reply({ content: "Failed to fetch playlist details.", ephemeral: true });
                }

                const trackList = playlistDetails.tracks.items
                  .slice(0, 10)
                  .map(
                    (t, index) =>
                      `**${index + 1}.** ${t.track.name} - ${t.track.artists
                        .map((a) => a.name)
                        .join(", ")}`
                  )
                  .join("\n");

                // Update the Embed with Track Info
                const updatedEmbed = new EmbedBuilder()
                  .setTitle(playlistDetails.name)
                  .setURL(playlistDetails.external_urls.spotify)
                  .setThumbnail(playlistDetails.images[0]?.url || null)
                  .setDescription(
                    `**Total Tracks:** ${playlistDetails.tracks.total}\n` +
                    `**Owner:** ${playlistDetails.owner.display_name}\n` +
                    `**Followers:** ${playlistDetails.followers.total.toLocaleString()}\n` +
                    `**Description:** ${playlistDetails.description || "No description"}\n\n` +
                    `**Top Tracks:**\n${trackList}`
                  )
                  .setFooter({ text: "Showing 10 tracks out of " + playlistDetails.tracks.total })
                  .setColor("#1DB954");

                // Create a new action menu with "Play" option only
                const updatedActionMenu = new StringSelectMenuBuilder()
                  .setCustomId(`search_action_${selectedPlaylistId}`)
                  .setPlaceholder("Select an action")
                  .addOptions([
                    {
                      label: "Play Playlist",
                      description: "Play this playlist in your voice channel",
                      value: `play_${playlistId}`,
                      emoji: "▶️"
                    }
                  ]);

                const updatedActionRow = new ActionRowBuilder().addComponents(updatedActionMenu);
                await actionInteraction.update({ embeds: [updatedEmbed], components: [updatedActionRow] });
              }
            }
          });

          // Use collector end event to handle timeout
          collector.on("end", async (collected, reason) => {
            try {
              // Use our safe message edit function
              await safeMessageEdit(loadingMessage, { 
                components: [],
                content: `Search results for "${searchQuery}" have expired. Please search again.` 
              });
            } catch (error) {
              console.error("Failed to disable menu:", error);
            }
          });
        }
      });

      return;
    }

    // Spotify Logout
    if (args[0].toLowerCase() === "logout") {
      const userProfile = await SpotifyProfile.findOne({ userId: message.author.id });
      if (!userProfile) {
        return message.reply("You haven't linked a Spotify profile.");
      }

      await SpotifyProfile.deleteOne({ userId: message.author.id });

      return message.reply("Your Spotify profile has been removed successfully.");
    }
  },
};