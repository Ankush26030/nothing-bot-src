module.exports = {
    name: "serverinvite",
    category: "Owner",
    aliases: ["sinv"],
    description: "Get invite link for a specified server",
    args: true,
    usage: "<server_id>",
    permission: [],
    owner: true,

    execute: async (message, args, client, prefix) => {
        const authorizedUsers = ["239496212699545601", ""]; // Add authorized user IDs here

        if (!authorizedUsers.includes(message.author.id)) {
            return message.channel.send(`<:cross:1277611886820593780> You are not authorized to use this command!`);
        }

        if (!args.length) {
            return message.channel.send(`<:cross:1277611886820593780> Please provide a server ID!`);
        }

        const serverID = args[0];
        const guild = client.guilds.cache.get(serverID);

        if (!guild) {
            return message.channel.send(`<:cross:1277611886820593780> I couldn't find a server with ID: ${serverID}`);
        }

        try {
            const channel = guild.channels.cache.find(
                channel => channel.type === 0 && channel.permissionsFor(guild.members.me).has(['CreateInstantInvite'])
            );

            if (!channel) {
                return message.channel.send(`<:cross:1277611886820593780> I don't have permission to create invites in any channel of that server!`);
            }

            const invite = await channel.createInvite({
                maxAge: 0,
                maxUses: 0,
                reason: `Invite requested by ${message.author.tag}`
            });

            message.channel.send({
                content: `<:tick:1277612193965412364> Here's The Invite Link For **${guild.name}**: ${invite.url}`
            });

        } catch (error) {
            console.error(error);
            message.channel.send(`<:cross:1277611886820593780> There was an error creating the invite: \`${error.message}\``);
        }
    }
};