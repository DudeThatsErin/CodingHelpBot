const { systemManager } = require('../../database.js');
const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'enable-system',
    description: 'Enables a bot system (challenges, suggestions, reports, thanks)',
    ownerOnly: 1,
    options: [
        {
            name: 'system',
            description: 'Which system to enable',
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

        // Special handling for suggestions system - collect configuration
        if (systemName === 'suggestions') {
            await this.handleSuggestionsSetup(interaction);
            return;
        }

        // Default handling for other systems
        try {
            const result = await systemManager.enableSystem(interaction.guild.id, systemName);
            
            if (result.success) {
                await interaction.reply({ 
                    content: `✅ Successfully enabled the **${systemName}** system for this server!`,
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: `❌ Failed to enable the ${systemName} system: ${result.error}`,
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('Error enabling system:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while enabling the system. Please try again.',
                ephemeral: true 
            });
        }
    },

    async handleSuggestionsSetup(interaction) {
        // Create channel select menu for suggestions channel
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId('suggestions_channel_select')
            .setPlaceholder('Select the suggestions channel')
            .setChannelTypes(ChannelType.GuildText);

        const row = new ActionRowBuilder().addComponents(channelSelect);

        const setupEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🛠️ Suggestions System Setup')
            .setDescription('Please configure the suggestions system for this server.')
            .addFields(
                { name: '📋 Step 1', value: 'Select the channel where suggestions will be posted', inline: false },
                { name: '⚙️ Default Settings', value: 'The following defaults will be applied:\n• Auto-reactions: 👍 👎\n• Auto-thread creation: Enabled\n• Thread auto-archive: 60 minutes\n• DM notifications: Enabled', inline: false }
            )
            .setFooter({ text: 'Select a channel below to continue setup' });

        await interaction.reply({
            embeds: [setupEmbed],
            components: [row],
            ephemeral: true
        });

        // Create collector for channel selection
        const filter = (i) => i.customId === 'suggestions_channel_select' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            const selectedChannel = i.channels.first();
            
            try {
                // Enable the suggestions system
                const result = await systemManager.enableSystem(interaction.guild.id, 'suggestions');
                
                if (result.success) {
                    // Store configuration
                    await systemManager.setSystemConfig(interaction.guild.id, 'suggestions', 'channel_id', selectedChannel.id);
                    await systemManager.setSystemConfig(interaction.guild.id, 'suggestions', 'auto_reactions', 'true');
                    await systemManager.setSystemConfig(interaction.guild.id, 'suggestions', 'auto_thread', 'true');
                    await systemManager.setSystemConfig(interaction.guild.id, 'suggestions', 'thread_archive_duration', '60');
                    await systemManager.setSystemConfig(interaction.guild.id, 'suggestions', 'dm_notifications', 'true');
                    
                    // Create success embed with all configuration details
                    const successEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('✅ Suggestions System Enabled')
                        .setDescription(`The suggestions system has been successfully configured for **${interaction.guild.name}**!`)
                        .addFields(
                            { name: '📍 Suggestions Channel', value: `${selectedChannel}`, inline: true },
                            { name: '🎯 Auto Reactions', value: '👍 👎', inline: true },
                            { name: '🧵 Auto Threads', value: 'Enabled', inline: true },
                            { name: '📦 Thread Archive', value: '60 minutes', inline: true },
                            { name: '📬 DM Notifications', value: 'Enabled', inline: true },
                            { name: '🔧 Status', value: 'Active', inline: true },
                            { name: '📝 Usage', value: 'Users can now use `/suggestions [message]` to submit suggestions', inline: false },
                            { name: '🎛️ Management Commands', value: '• `/status-sugg` - Check suggestion status\n• `/edit-sugg` - Edit suggestions\n• `/completed-sugg` - Mark as completed\n• `/denied-sugg` - Mark as denied', inline: false }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'System configuration complete' });

                    await i.update({
                        embeds: [successEmbed],
                        components: []
                    });
                } else {
                    await i.update({
                        content: `❌ Failed to enable the suggestions system: ${result.error}`,
                        embeds: [],
                        components: []
                    });
                }
            } catch (error) {
                console.error('Error setting up suggestions system:', error);
                await i.update({
                    content: '❌ An error occurred while setting up the suggestions system. Please try again.',
                    embeds: [],
                    components: []
                });
            }
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: '⏰ Setup timed out. Please run the command again to configure the suggestions system.',
                    embeds: [],
                    components: []
                });
            }
        });
    }
};
