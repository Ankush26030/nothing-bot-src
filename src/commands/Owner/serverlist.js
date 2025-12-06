const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const load = require('lodash');

module.exports = {
    name: "serverlist",
    category: "Owner",
    aliases: ["slist"],
    description: "",
    args: false,
    usage: "<string>",
    permission: [],
    owner: true,
    execute: async (message, args, client, prefix) => {
        const serverlist = client.guilds.cache.map((guild, i) => `**\`\`\`Server Name: "${guild.name}"\nGuild ID: "${guild.id}"\nMember Count: "${guild.memberCount}"\`\`\`**`);
        const mapping = load.chunk(serverlist, 10);
        const pages = mapping.map((s) => s.join("\n"));
        let page = 0;

        if (client.guilds.cache.size <= 10) {
            // If there's only one page, just send it without navigation
            const embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription(pages[page])
                .setFooter({
                    text: `Page ${page + 1}/${pages.length}`,
                    iconURL: message.author.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);
            
            return await message.channel.send({
                embeds: [embed]
            });
        } else {
            // Create initial embed
            const embed = new EmbedBuilder()
                .setColor(client.ankushcolor)
                .setDescription(pages[page])
                .setFooter({
                    text: `Page ${page + 1}/${pages.length}`,
                    iconURL: message.author.displayAvatarURL({
                        dynamic: true,
                    }),
                })
                .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);

            // Create a dropdown for page navigation
            const totalPages = pages.length;
            
            // Create options for page selection
            const pageOptions = [];
            for (let i = 0; i < Math.min(totalPages, 25); i++) {
                pageOptions.push({
                    label: `Page ${i + 1}`,
                    description: `Jump to page ${i + 1}`,
                    value: i.toString()
                });
            }
            
            const pageDropdown = new StringSelectMenuBuilder()
                .setCustomId('server_list_page_select')
                .setPlaceholder(`Jump to page (1-${Math.min(totalPages, 25)})`)
                .addOptions(pageOptions);
            
            // Create a dropdown for group navigation if more than 25 pages
            let groupDropdown = null;
            if (totalPages > 25) {
                const jumpGroups = Math.ceil(totalPages / 25);
                const groupOptions = [];
                
                for (let i = 0; i < jumpGroups; i++) {
                    const groupStart = i * 25 + 1;
                    const groupEnd = Math.min((i + 1) * 25, totalPages);
                    
                    groupOptions.push({
                        label: `Group ${i + 1}`,
                        description: `Pages ${groupStart}-${groupEnd}`,
                        value: i.toString()
                    });
                }
                
                groupDropdown = new StringSelectMenuBuilder()
                    .setCustomId('server_list_group_select')
                    .setPlaceholder(`Select page group (total: ${jumpGroups} groups)`)
                    .addOptions(groupOptions);
            }

            // Create action rows
            const pageDropdownRow = new ActionRowBuilder().addComponents([pageDropdown]);
            
            // Create components array
            const components = [pageDropdownRow];
            
            // Add group dropdown if needed
            if (groupDropdown) {
                const groupDropdownRow = new ActionRowBuilder().addComponents([groupDropdown]);
                components.push(groupDropdownRow);
            }

            // Create a dropdown for session control
            const controlOptions = [
                {
                    label: "Close Menu",
                    description: "Close the server list navigation",
                    value: "close"
                }
            ];
            
            const controlDropdown = new StringSelectMenuBuilder()
                .setCustomId('server_list_control')
                .setPlaceholder('Control Menu')
                .addOptions(controlOptions);
                
            const controlRow = new ActionRowBuilder().addComponents([controlDropdown]);
            components.push(controlRow);

            // Send the message with the components
            const msg = await message.channel.send({
                embeds: [embed],
                components: components
            });

            // Create collector for interactions
            const collector = message.channel.createMessageComponentCollector({
                filter: (i) => {
                    if (i.user.id === message.author.id) return true;
                    else {
                        i.reply({
                            ephemeral: true,
                            content: `Only **${message.author.tag}** can use this menu, if you want then you've to run the command again.`,
                        });
                        return false;
                    }
                },
                time: 60000 * 5,
                idle: 60000 * 2
            });

            collector.on("collect", async (interaction) => {
                await interaction.deferUpdate().catch(() => {});
                
                let groupChanged = false;
                let currentGroup = Math.floor(page / 25);
                
                // Handle different component interactions
                if (interaction.customId === "server_list_page_select") {
                    page = parseInt(interaction.values[0]);
                } else if (interaction.customId === "server_list_group_select") {
                    const groupIndex = parseInt(interaction.values[0]);
                    page = groupIndex * 25; // Go to the first page of the selected group
                    groupChanged = true;
                } else if (interaction.customId === "server_list_control") {
                    if (interaction.values[0] === "close") {
                        collector.stop();
                        return;
                    }
                }
                
                // Check if we've moved to a different group
                const newGroup = Math.floor(page / 25);
                if (newGroup !== currentGroup || groupChanged) {
                    // Update page dropdown options for the new group
                    const newStartPage = newGroup * 25;
                    const newEndPage = Math.min(newStartPage + 25, totalPages);
                    
                    const newPageOptions = [];
                    for (let i = newStartPage; i < newEndPage; i++) {
                        newPageOptions.push({
                            label: `Page ${i + 1}`,
                            description: `Jump to page ${i + 1}`,
                            value: i.toString()
                        });
                    }
                    
                    // Update the page dropdown
                    pageDropdown.setOptions(newPageOptions);
                    pageDropdown.setPlaceholder(`Jump to page (${newStartPage + 1}-${newEndPage})`);
                    
                    currentGroup = newGroup;
                }
                
                // Update the embed
                const newEmbed = new EmbedBuilder()
                    .setColor(client.ankushcolor)
                    .setDescription(pages[page])
                    .setFooter({
                        text: `Page ${page + 1}/${pages.length}`,
                        iconURL: message.author.displayAvatarURL({
                            dynamic: true,
                        }),
                    })
                    .setTitle(`${message.client.user.username} Server List [${client.guilds.cache.size}]`);

                // Rebuild the components
                const newPageDropdownRow = new ActionRowBuilder().addComponents([pageDropdown]);
                
                const newComponents = [newPageDropdownRow];
                
                // Add group dropdown if needed
                if (groupDropdown) {
                    const newGroupDropdownRow = new ActionRowBuilder().addComponents([groupDropdown]);
                    newComponents.push(newGroupDropdownRow);
                }
                
                // Add control dropdown
                const newControlRow = new ActionRowBuilder().addComponents([controlDropdown]);
                newComponents.push(newControlRow);

                // Update the message
                await msg.edit({
                    embeds: [newEmbed],
                    components: newComponents
                });
            });

            collector.on("end", async () => {
                // When collector ends, remove all interactive components
                await msg.edit({
                    components: []
                });
            });
        }
    }
}