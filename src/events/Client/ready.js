const { ActivityType } = require("discord.js");
const NoPrefixes = require('../../models/noprefix');

// Add this global variable (needs to be accessible from both files)
global.isReady = false;

module.exports = {
    name: "ready",
    run: async (client) => {
        client.logger.log(`${client.user.username} online!`, "ready");
        client.logger.log(`Ready on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, "ready");
        
        let statuses = [`${client.prefix}help`, `${client.prefix}play`];
        setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setPresence({
                activities: [{ name: status, type: ActivityType.Listening }],
                status: "dnd"
            });
        }, 5000);
        
        // Booster checking logic
        const supportGuild = client.guilds.cache.get("1221909487472869619");
        if (!supportGuild) return console.log("Guild not found!");
        const role = supportGuild.roles.premiumSubscriberRole;
        if (!role) return console.log("Premium role not found!");
        
        try {
            await supportGuild.members.fetch();
            const boosters = supportGuild.members.cache.filter(member => member.roles.cache.has(role.id));
            console.log(`Found ${boosters.size} boosters.`);
            
            for (const booster of boosters.values()) {
                const existing = await NoPrefixes.findOne({ where: { userId: booster.id } });
                if (!existing) {
                    await NoPrefixes.create({ userId: booster.id });
                    console.log(`Auto NoPrefix given to ${booster.user.tag}`);
                    await client.channels.cache.get("1364788828514287646")?.send(
                        `✅ Auto NoPrefix Added to \`${booster.user.tag}\` for \`Already Boosting The Server\``
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching or processing boosters:", error);
        }
        
        console.log("Finished checking boosters.");
        
        // Add delay before enabling guild leave tracking
        setTimeout(() => {
            global.isReady = true;
            console.log('Bot is now ready to track guild leave events');
        }, 10000); // 10-second delay to ensure all guilds are properly cached
    }
};