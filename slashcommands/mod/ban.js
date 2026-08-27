const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Ban a member from the server.',
    usage: '/ban <user|user_id> [reason] [delete_days]',
    example: '/ban @user Spamming 1',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to ban (mention).', type: 6, required: false },
        { name: 'user_id', description: 'Ban by Discord user ID (for users not in the server).', type: 3, required: false },
        { name: 'reason', description: 'Reason for the ban.', type: 3, required: false },
        { name: 'delete_days', description: 'Days of their messages to delete (0-7).', type: 4, required: false, min_value: 0, max_value: 7 }
    ],
    async execute(interaction, client) {
        const mentionedUser = interaction.options.getUser('user');
        const rawId = interaction.options.getString('user_id')?.trim();
        const reason = interaction.options.getString('reason');
        const deleteDays = interaction.options.getInteger('delete_days') || 0;

        if (!mentionedUser && !rawId) {
            return interaction.reply({ content: 'Please provide a user mention or a user ID.', flags: MessageFlags.Ephemeral });
        }
        if (mentionedUser && rawId) {
            return interaction.reply({ content: 'Please provide either a user mention or a user ID, not both.', flags: MessageFlags.Ephemeral });
        }

        let targetUser = mentionedUser;
        if (rawId) {
            if (!/^\d{17,20}$/.test(rawId)) {
                return interaction.reply({ content: 'That does not look like a valid Discord user ID (17-20 digits).', flags: MessageFlags.Ephemeral });
            }
            targetUser = await client.users.fetch(rawId).catch(() => null);
            if (!targetUser) {
                return interaction.reply({ content: `Could not find a user with ID \`${rawId}\`. They may not exist.`, flags: MessageFlags.Ephemeral });
            }
        }

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
