const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a member from the server.',
    usage: '/ban <user> [reason] [delete_days]',
    example: '/ban @user Spamming 1',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to ban.', type: 6, required: true },
        { name: 'reason', description: 'Reason for the ban.', type: 3, required: false },
        { name: 'delete_days', description: 'Days of their messages to delete (0-7).', type: 4, required: false, min_value: 0, max_value: 7 }
    ],
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const deleteDays = interaction.options.getInteger('delete_days') || 0;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const result = await client.moderation.ban({
            guild: interaction.guild,
            moderator: interaction.member,
            targetUser,
            targetMember,
            reason,
            deleteDays
        });

        await interaction.reply({ content: result.message, flags: result.success ? undefined : MessageFlags.Ephemeral });
    }
};
