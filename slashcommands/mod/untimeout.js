const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'untimeout',
    description: 'Remove a timeout from a member.',
    usage: '/untimeout <user> [reason]',
    example: '/untimeout @user Resolved',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to remove the timeout from.', type: 6, required: true },
        { name: 'reason', description: 'Reason for removing the timeout.', type: 3, required: false }
    ],
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const result = await client.moderation.untimeout({
            guild: interaction.guild,
            moderator: interaction.member,
            targetMember,
            reason
        });

        await interaction.reply({ content: result.message, flags: result.success ? undefined : MessageFlags.Ephemeral });
    }
};
