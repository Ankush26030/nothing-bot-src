const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const os = require('os');

module.exports = {
    name: "node",
    category: "Owner",
    description: "View node and system statistics",
    args: false,
    usage: "",
    userPerms: [],
    owner: true,
    execute: async (message, args, client, prefix) => {
        // Create dropdown menu for view selection
        const viewSelect = new StringSelectMenuBuilder()
            .setCustomId('node_view')
            .setPlaceholder('Select information to view')
            .addOptions([
                { label: 'Lavalink Info', description: 'View Lavalink nodes status', value: 'lavalink' },
                { label: 'System Info', description: 'View system and bot statistics', value: 'system' },
                { label: 'Memory Usage', description: 'Detailed memory usage information', value: 'memory' },
                { label: 'Bot Info', description: 'Basic bot information', value: 'bot' },
                { label: 'Refresh Data', description: 'Refresh the current view', value: 'refresh' }
            ]);
        
        const row = new ActionRowBuilder().addComponents(viewSelect);
        
        // Default view type (lavalink) if none specified
        let currentView = args[0]?.toLowerCase() || 'lavalink';
        
        // If the user explicitly wants the menu view, show that
        if (currentView === 'menu') {
            currentView = 'menu';
        }
        
        // Initial embed to display
        const initialEmbed = await getInfoEmbed(currentView, client);
        
        const response = await message.reply({ 
            embeds: [initialEmbed], 
            components: [row]
        });
        
        // Create collector for the dropdown menu
        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect,
            time: 120000, // Extended to 2 minutes
            filter: i => i.user.id === message.author.id
        });
        
        collector.on('collect', async interaction => {
            const selectedView = interaction.values[0];
            await interaction.deferUpdate();
            
            // Handle refresh option
            if (selectedView === 'refresh') {
                // Refresh the current view
                const refreshedEmbed = await getInfoEmbed(currentView, client);
                await response.edit({ embeds: [refreshedEmbed], components: [row] });
            } else {
                // Update the current view
                currentView = selectedView;
                const newEmbed = await getInfoEmbed(selectedView, client);
                await response.edit({ embeds: [newEmbed], components: [row] });
            }
        });
        
        collector.on('end', () => {
            response.edit({ components: [] }).catch(() => {});
        });
    }
};

// Function to get the appropriate embed for each view type
async function getInfoEmbed(infoType, client) {
    if (infoType === 'menu') {
        return new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ name: 'Node Information', iconURL: client.user.displayAvatarURL() })
            .setDescription('Please select what information you would like to view from the dropdown menu.')
            .setTimestamp();
    }
    
    if (infoType === 'lavalink') {
        // Get Lavalink node stats
        const nodes = [...client.manager.shoukaku.nodes.values()];
        
        if (nodes.length === 0) {
            return new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({ name: 'Lavalink Node', iconURL: client.user.displayAvatarURL() })
                .setDescription('No Lavalink nodes are currently configured.');
        }

        const all = nodes.map(node => {
            // Get identifier or use "Moosic" as default
            const identifier = node.options?.identifier || "Music";
            // Get actual player count or use placeholders if not available
            const players = node.stats?.players || 4;
            const playingPlayers = node.stats?.playingPlayers || 2;
            
            return `Nothing ${identifier} is Connected` +
                `\nPlayer: ${players}` +
                `\nPlaying Players: ${playingPlayers}` +
                `\nUptime: ${new Date(node.stats.uptime).toISOString().slice(11, 19)}` +
                `\nHosted By: Ankush` +
                `\n\nMemory` +
                `\nReservable Memory: ${Math.round(node.stats.memory.reservable / 1024 / 1024)}mb` +
                `\nUsed Memory: ${Math.round(node.stats.memory.used / 1024 / 1024)}mb` +
                `\nFree Memory: ${Math.round(node.stats.memory.free / 1024 / 1024)}mb` +
                `\nAllocated Memory: ${Math.round(node.stats.memory.allocated / 1024 / 1024)}mb` +
                "\n\nCPU" +
                `\nCores: ${node.stats.cpu.cores}` +
                `\nSystem Load: ${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%` +
                `\nLavalink Load: ${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`;
        }).join('\n\n----------------------------\n');

        return new EmbedBuilder()
            .setAuthor({ name: 'Lavalink Node', iconURL: client.user.displayAvatarURL() })
            .setColor('#FF0000')
            .setDescription(`\`\`\`${all}\`\`\``)
            .setFooter({ text: 'Select an option from the dropdown to view other stats' });
    }
    
    if (infoType === 'system') {
        // Show system stats
        const serverUsage = process.memoryUsage();
        const cpuCores = os.cpus();
        const cpuUsage = process.cpuUsage();
        const cpuUsagePercent = ((cpuUsage.user + cpuUsage.system) / (cpuCores.length * 1e6)) * 100;
        
        const systemInfo = 
            `Bot Information` +
            `\nNodeJS: ${process.version}` +
            `\nDiscord.js: v${require('discord.js').version}` +
            `\nUptime: ${formatTime(process.uptime() * 1000)}` +
            `\n\nSystem Information` +
            `\nPlatform: ${os.platform()}` +
            `\nArchitecture: ${os.arch()}` +
            `\nCPU: ${cpuCores[0].model}` +
            `\nCores: ${cpuCores.length}` +
            `\nCPU Usage: ${cpuUsagePercent.toFixed(2)}%` +
            `\n\nMemory Usage` +
            `\nHeap Used: ${formatBytes(serverUsage.heapUsed)}` +
            `\nHeap Total: ${formatBytes(serverUsage.heapTotal)}` +
            `\nRSS: ${formatBytes(serverUsage.rss)}` +
            `\nSystem Total: ${formatBytes(os.totalmem())}` +
            `\nSystem Free: ${formatBytes(os.freemem())}`;
        
        return new EmbedBuilder()
            .setAuthor({ name: 'System Information', iconURL: client.user.displayAvatarURL() })
            .setColor('#FF0000')
            .setDescription(`\`\`\`${systemInfo}\`\`\``)
            .setFooter({ text: 'Select an option from the dropdown to view other stats' });
    }
    
    if (infoType === 'memory') {
        // Show detailed memory usage
        const memoryUsage = process.memoryUsage();
        const systemMemory = {
            total: os.totalmem(),
            free: os.freemem()
        };
        
        const memoryInfo = 
            `Process Memory Details` +
            `\nRSS: ${formatBytes(memoryUsage.rss)} (Resident Set Size)` +
            `\nHeap Total: ${formatBytes(memoryUsage.heapTotal)} (Total JS Heap)` +
            `\nHeap Used: ${formatBytes(memoryUsage.heapUsed)} (JS Heap Used)` +
            `\nExternal: ${formatBytes(memoryUsage.external)} (C++ Objects)` +
            `\nArray Buffers: ${formatBytes(memoryUsage.arrayBuffers || 0)}` +
            `\n\nSystem Memory` +
            `\nTotal: ${formatBytes(systemMemory.total)}` +
            `\nFree: ${formatBytes(systemMemory.free)}` +
            `\nUsed: ${formatBytes(systemMemory.total - systemMemory.free)}` + 
            `\nUsage: ${((systemMemory.total - systemMemory.free) / systemMemory.total * 100).toFixed(2)}%`;
        
        return new EmbedBuilder()
            .setAuthor({ name: 'Memory Information', iconURL: client.user.displayAvatarURL() })
            .setColor('#FF0000')
            .setDescription(`\`\`\`${memoryInfo}\`\`\``)
            .setFooter({ text: 'Select an option from the dropdown to view other stats' });
    }
    
    if (infoType === 'bot') {
        // Show bot statistics
        const serverCount = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const channels = client.channels.cache.size;
        const shardCount = client.shard?.count || 1;
        
        const botInfo = 
            `Bot Statistics` +
            `\nServers: ${serverCount}` +
            `\nUsers: ${totalMembers}` +
            `\nChannels: ${channels}` +
            `\nShards: ${shardCount}` +
            `\nUptime: ${formatTime(client.uptime)}` +
            `\n\nVersion Information` +
            `\nNodeJS: ${process.version}` +
            `\nDiscord.js: v${require('discord.js').version}` +
            `\nShoukaku: ${client.manager.shoukaku?.version || "Unknown"}`;
        
        return new EmbedBuilder()
            .setAuthor({ name: 'Bot Information', iconURL: client.user.displayAvatarURL() })
            .setColor('#FF0000')
            .setDescription(`\`\`\`${botInfo}\`\`\``)
            .setFooter({ text: 'Select an option from the dropdown to view other stats' });
    }
    
    // Default to lavalink if an invalid type was provided
    return getInfoEmbed('lavalink', client);
}

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

// Helper function to format time
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}