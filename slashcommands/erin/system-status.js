const { systemManager } = require('../../database.js');
const Discord = require('discord.js');

module.exports = {
    name: 'system-status',
    description: 'Shows the status of all bot systems',
    ownerOnly: 1,
    async execute(interaction) {
        try {
            const systems = ['challenges', 'suggestions', 'reports', 'thanks'];
            const statusList = [];
            
            for (const system of systems) {
                const isEnabled = await systemManager.isSystemEnabled(interaction.guild.id, system);
                const status = isEnabled ? '✅ Enabled' : '❌ Disabled';
                statusList.push(`**${system.charAt(0).toUpperCase() + system.slice(1)}**: ${status}`);
            }
            
            const embed = new Discord.EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Bot System Status')
                .setDescription(statusList.join('\n'))
                .setFooter({ text: 'Use /enable-system or /disable-system to change status' })
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error checking system status:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while checking system status. Please try again.',
                ephemeral: true 
            });
        }
    }
};
