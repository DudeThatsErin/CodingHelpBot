const { EmbedBuilder } = require('discord.js');
const { disableSystem } = require('../../database-init.js');

module.exports = {
    name: 'disable-challenge-system',
    description: 'Disables the challenge system for this server',
    usage: '/disable-challenge-system',
    modOnly: 1,
    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            const success = await disableSystem(guildId, 'challenges');
            
            if (success) {
                const embed = new EmbedBuilder()
                    .setColor(0xff9900)
                    .setTitle('⚠️ Challenge System Disabled')
                    .setDescription('The challenge system has been disabled for this server.')
                    .addFields(
                        { name: 'Note', value: 'Challenge data is preserved but commands will not work until re-enabled.' }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                throw new Error('Failed to disable challenge system');
            }
        } catch (error) {
            console.error('Error disabling challenge system:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('Failed to disable the challenge system. Please try again or contact an administrator.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
