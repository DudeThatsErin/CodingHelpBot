const { EmbedBuilder, MessageFlags } = require('discord.js');
const { COLORS } = require('../../logging/logger');

module.exports = {
    name: 'afk-remove',
    description: 'Manually remove your AFK status',
    usage: '/afk-remove',
    example: '/afk-remove',
    async execute(interaction) {
        // Defer the reply to prevent timeout
        await interaction.deferReply({ ephemeral: true });
        
        const isAFK = await interaction.client.afkManager.isUserAFK(interaction.user.id, interaction.guild.id);
        if (!isAFK) {
            return await interaction.followUp({
                content: '❌ You are not currently AFK.',
                ephemeral: true
            });
        }
        
        await interaction.client.afkManager.removeUserAFK(interaction.user.id, interaction.guild.id);
        
        // Remove (AFK) from nickname
        try {
            const member = await interaction.guild.members.fetch(interaction.user.id);
            const currentNick = member.displayName;
            
            // Remove (AFK) if it's there
            if (currentNick.endsWith(' (AFK)')) {
                const newNick = currentNick.replace(' (AFK)', '');
                await member.setNickname(newNick === member.user.username ? null : newNick);
            }
        } catch (error) {
            if (error.code === 50013) {
                console.log(`Cannot update nickname for ${interaction.user.tag}: Missing permissions (role hierarchy)`);
            } else {
                console.error('Error updating nickname after AFK removal:', error);
            }
            // Continue even if nickname update fails
        }
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setTitle('✅ AFK Status Removed')
            .setDescription('Your AFK status has been manually removed.')
            .setTimestamp();
        
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
};
