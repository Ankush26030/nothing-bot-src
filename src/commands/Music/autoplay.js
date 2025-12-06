const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "autoplay",
    aliases: ["ap"],
    category: "Music",
    description: "Toggle music autoplay",
    args: false,
    usage: "",
    userPrams: [],
    cooldown: 4,
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = client.manager.players.get(message.guild.id);
        
        if (!player) {
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: message.author.username || "Unknown User",
                    iconURL: message.author.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(`No song/s currently playing within this guild.`)
                .setColor(client.ankushcolor);
            return message.channel.send({ embeds: [embed] });
        }

        const autoplay = player.data.get("autoplay");
        player.data.set("autoplay", !autoplay);

        // If enabling autoplay, set up the autoplay system data
        if (!autoplay) {
            const currentTrack = player.queue.current;
            if (currentTrack) {
                player.data.set("autoplaySystem", {
                    title: currentTrack.title,
                    author: currentTrack.author,
                    requester: currentTrack.requester || message.author
                });
                
                // Store the requester for autoplay function
                player.data.set("requester", currentTrack.requester || message.author);
                
                console.log(`✅ Autoplay enabled for: ${currentTrack.title} by ${currentTrack.author}`);
            }
        } else {
            // Clear autoplay data when disabled
            player.data.delete("autoplaySystem");
            player.data.delete("playHistory");
            player.data.delete("artistCooldown");
            console.log(`❌ Autoplay disabled`);
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`Autoplay has been ${!autoplay ? 'enabled' : 'disabled'}`)
            .setColor(client.ankushcolor)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    },
};