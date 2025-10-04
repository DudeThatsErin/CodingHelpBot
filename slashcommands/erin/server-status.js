const Discord = require('discord.js');
const bot = require('../../config/bot.json');
const color = require('../../config/embed.json');
const { getServerConfig } = require('../../utils/serverConfig');

module.exports = {
    name: 'server-status',
    description: 'Pushes an embed to display in the channel about a server update',
    modOnly: 1,
    options: [
        {
            name: 'message',
            description: 'What would you like to announce about the server?',
            type: 3,
            required: true
        }
    ],
    async execute(interaction, client) {
        const reason = interaction.options.getString('message');
        const serverConfig = getServerConfig(interaction.guild.id);
        
        if (!serverConfig) {
            return await interaction.reply({ 
                content: 'This command is not configured for this server.', 
                ephemeral: true 
            });
        }

        const channel = client.channels.cache.get(serverConfig.announcementsChannelId);
        
        if (!channel) {
            return await interaction.reply({ 
                content: 'Could not find the announcements channel!', 
                ephemeral: true 
            });
        }

        let embed = new Discord.EmbedBuilder()
            .setColor(parseInt(color.navy_color, 16))
            .setTitle('Server Update!')
            .setDescription(reason)
            .setTimestamp()
            .setFooter({text: 'Want to suggest a feature for the server? Use /suggestions', iconURL: bot.avatar});

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply({ 
                content: `✅ Server status update sent to ${channel}!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error sending server status:', error);
            await interaction.reply({ 
                content: '❌ Failed to send server status update.', 
                ephemeral: true 
            });
        }
    }
};
