const { MessageFlags } = require('discord.js');
const { parseDuration } = require('../../moderation.js');

module.exports = {
    name: 'timeout',
    description: 'Timeout (mute) a member for a set duration.',
    usage: '/timeout <user> <duration> [reason]',
    example: '/timeout @user 1h Spamming',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to timeout.', type: 6, required: true },
        { name: 'duration', description: 'Duration, e.g. 10m, 2h, 1d, 1w (max 28d).', type: 3, required: true },
        { name: 'reason', description: 'Reason for the timeout.', type: 3, required: false }
    ],
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const durationMs = parseDuration(interaction.options.getString('duration'));
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const result = await client.moderation.timeout({
            guild: interaction.guild,
            moderator: interaction.member,
            targetMember,
            durationMs,
            reason
        });

        await interaction.reply({ content: result.message, flags: result.success ? undefined : MessageFlags.Ephemeral });
    }
};
