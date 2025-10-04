const { systemManager } = require('../../database.js');

module.exports = {
    name: 'disable-system',
    description: 'Disables a bot system (challenges, suggestions, reports, thanks)',
    ownerOnly: 1,
    options: [
        {
            name: 'system',
            description: 'Which system to disable',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Challenges',
                    value: 'challenges'
                },
                {
                    name: 'Suggestions', 
                    value: 'suggestions'
                },
                {
                    name: 'Reports',
                    value: 'reports'
                },
                {
                    name: 'Thanks',
                    value: 'thanks'
                }
            ]
        }
    ],
    async execute(interaction) {
        const systemName = interaction.options.getString('system');

        try {
            const result = await systemManager.disableSystem(interaction.guild.id, systemName);
            
            if (result.success) {
                await interaction.reply({ 
                    content: `✅ Successfully disabled the **${systemName}** system for this server!`,
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: `❌ Failed to disable the ${systemName} system: ${result.error}`,
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('Error disabling system:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while disabling the system. Please try again.',
                ephemeral: true 
            });
        }
    }
};
