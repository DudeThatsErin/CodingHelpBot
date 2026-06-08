const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Kick a member from the server.',
    usage: '/kick <user> [reason]',
    example: '/kick @user Breaking rules',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to kick.', type: 6, required: true },
        { name: 'reason', description: 'Reason for the kick.', type: 3, required: false }
    ],
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const result = await client.moderation.kick({
            guild: interaction.guild,
            moderator: interaction.member,
            targetMember,
            reason
        });

        await interaction.reply({ content: result.message, flags: result.success ? undefined : MessageFlags.Ephemeral });
    }
};
