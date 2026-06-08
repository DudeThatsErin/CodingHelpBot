const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Show account info, roles, and warnings for a user.',
    usage: '/userinfo [user]',
    example: '/userinfo @user',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user to look up (defaults to yourself).', type: 6, required: false }
    ],
    async execute(interaction, client) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        const embed = await client.moderation.buildUserInfoEmbed(interaction.guild, targetUser, targetMember);
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
