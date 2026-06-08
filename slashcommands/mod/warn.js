const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'warn',
    description: 'Warn a member and record it.',
    usage: '/warn <user> <reason>',
    example: '/warn @user Please follow the rules',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to warn.', type: 6, required: true },
        { name: 'reason', description: 'Reason for the warning.', type: 3, required: true }
    ],
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const result = await client.moderation.warn({
            guild: interaction.guild,
            moderator: interaction.member,
            targetUser,
            targetMember,
            reason
        });

        await interaction.reply({ content: result.message, flags: result.success ? undefined : MessageFlags.Ephemeral });
    }
};
