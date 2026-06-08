const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'User Info',
    type: 2, // USER context menu
    modOnly: 1,
    async execute(interaction, client) {
        const targetUser = interaction.targetUser;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const embed = await client.moderation.buildUserInfoEmbed(interaction.guild, targetUser, targetMember);
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
