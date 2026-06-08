const { EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS } = require('../../logging/logger');

module.exports = {
    name: 'afk',
    description: 'Set yourself as AFK with an optional message and duration',
    usage: '/afk [message] [duration]',
    example: '/afk "Working on a project" 2h',
    options: [
        {
            name: 'message',
            description: 'Message to show when someone pings you (optional)',
            required: false,
            type: 3
        },
        {
            name: 'duration',
            description: 'How long to stay AFK (e.g., 30m, 2h, 1d) - default is until you send a message',
            required: false,
            type: 3
        }
    ],
    async execute(interaction) {
        // Defer the reply to prevent timeout
        await interaction.deferReply();
        
        const message = interaction.options.getString('message') || 'I am currently AFK';
        const durationInput = interaction.options.getString('duration');
        
        // Parse duration
        let durationMs = null;
        let durationText = 'until you send a message';
        
        if (durationInput) {
            const durationMatch = durationInput.match(/^(\d+)([mhd])$/i);
            if (durationMatch) {
                const value = parseInt(durationMatch[1]);
                const unit = durationMatch[2].toLowerCase();
                
                switch (unit) {
                    case 'm':
                        durationMs = value * 60 * 1000;
                        durationText = `${value} minute${value !== 1 ? 's' : ''}`;
                        break;
                    case 'h':
                        durationMs = value * 60 * 60 * 1000;
                        durationText = `${value} hour${value !== 1 ? 's' : ''}`;
                        break;
                    case 'd':
                        durationMs = value * 24 * 60 * 60 * 1000;
                        durationText = `${value} day${value !== 1 ? 's' : ''}`;
                        break;
                }
            } else {
                return await interaction.followUp({
                    content: '❌ Invalid duration format. Use format like: 30m, 2h, 1d',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
        
        // Store AFK data using AFK Manager
        try {
            const afkData = await interaction.client.afkManager.setUserAFK(
                interaction.user.id,
                interaction.guild.id,
                interaction.channel.id,
                message,
                durationMs
            );
        } catch (error) {
            console.error('Error setting AFK:', error);
            return await interaction.followUp({
                content: '❌ Failed to set AFK status. Please try again.',
                flags: MessageFlags.Ephemeral
            });
        }
        
        // Update nickname to add (AFK)
        let nicknameUpdated = false;
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const currentNick = member.displayName;
            
            // Only add (AFK) if it's not already there
            if (!currentNick.endsWith('(AFK)')) {
                await member.setNickname(`${currentNick} (AFK)`);
                nicknameUpdated = true;
            }
        } catch (error) {
            if (error.code === 50013) {
                if (interaction.guild.ownerId === interaction.user.id) {
                    console.log(`Cannot update nickname for ${interaction.user.tag}: Server owners cannot have nicknames changed by bots`);
                } else {
                    console.log(`Cannot update nickname for ${interaction.user.tag}: Missing permissions (role hierarchy)`);
                }
            } else {
                console.error('Error updating nickname for AFK:', error);
            }
            // Continue even if nickname update fails
        }
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.blurple)
            .setTitle('AFK Status Set')
            .setDescription(`You are now AFK for **${durationText}**`)
            .addFields(
                {
                    name: 'Message',
                    value: message,
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Send any message to remove your AFK status' });
        
        await interaction.followUp({ embeds: [embed] });
    }
};
