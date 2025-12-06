const NoPrefixes = require('../../models/noprefix');
const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberUpdate,
    run: async (client, oldMember, newMember) => {
        if (!oldMember || !newMember) return; // Ensure both members exist

        if (oldMember.guild.id !== "1221909487472869619") return;

        const supportGuild = client.guilds.cache.get("1221909487472869619");
        if (!supportGuild) return;

        const role = supportGuild.roles.premiumSubscriberRole;
        if (!role) return;

        const hadRoleBefore = oldMember.roles.cache.has(role.id);
        const hasRoleNow = newMember.roles.cache.has(role.id);

        try {
            if (!hadRoleBefore && hasRoleNow) {
                const existing = await NoPrefixes.findOne({ where: { userId: newMember.id } });

                if (!existing) {
                    await NoPrefixes.create({ userId: newMember.id });
                    console.log(`✅ Auto NoPrefix added to ${newMember.user.tag}`);
                    await client.channels.cache.get("1364788828514287646")?.send(
                        `✅ Auto NoPrefix Added to \`${newMember}\` with reason: \`Boosted The Server\``
                    );
                }
            } else if (hadRoleBefore && !hasRoleNow) {
                await NoPrefixes.destroy({ where: { userId: oldMember.id } });
                console.log(`❌ Auto NoPrefix removed from ${oldMember.user.tag}`);
                await client.channels.cache.get("1364788830174969910")?.send(
                    `❌ Auto NoPrefix Removed from \`${oldMember}\` with reason: \`Removed The Boost\``
                );
            }
        } catch (error) {
            console.error("Error updating NoPrefix status:", error);
        }
    },
};
