const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unban a user by their ID.',
    usage: '/unban <user_id> [reason]',
    example: '/unban 123456789012345678 Appeal accepted',
    modOnly: 1,
    options: [
        { name: 'user_id', description: 'The ID of the user to unban.', type: 3, required: true },
        { name: 'reason', description: 'Reason for the unban.', type: 3, required: false }
    ],
    async execute(interaction, client) {
        const userId = interaction.options.getString('user_id').trim();
        const reason = interaction.options.getString('reason');

        if (!/^\d{17,20}$/.test(userId)) {
            return interaction.reply({ content: 'That does not look like a valid user ID.', flags: MessageFlags.Ephemeral });
        }

        const result = await client.moderation.unban({
            guild: interaction.guild,
            moderator: interaction.member,
            userId,
            reason
        });

        await interaction.reply({ content: result.message, flags: result.success ? undefined : MessageFlags.Ephemeral });
    }
};
