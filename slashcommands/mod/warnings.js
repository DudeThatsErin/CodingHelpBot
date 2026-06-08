const { EmbedBuilder, MessageFlags } = require('discord.js');
const { getWarns } = require('../../database-init.js');
const { COLORS } = require('../../logging/logger');
const { formatDate } = require('../../moderation.js');

module.exports = {
    name: 'warnings',
    description: "List a user's warnings.",
    usage: '/warnings <user>',
    example: '/warnings @user',
    modOnly: 1,
    options: [
        { name: 'user', description: 'The user whose warnings to view.', type: 6, required: true }
    ],
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const warns = await getWarns(targetUser.id, interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor(warns.length ? COLORS.orange : COLORS.green)
            .setTitle(`Warnings for ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setDescription(`Total warnings: **${warns.length}**`)
            .setTimestamp();

        if (warns.length === 0) {
            embed.addFields({ name: 'No warnings', value: 'This user has a clean record.', inline: false });
        } else {
            for (const warn of warns.slice(0, 20)) {
                embed.addFields({
                    name: `Warning #${warn.id} — ${formatDate(warn.timestamp)}`,
                    value: `**Reason:** ${warn.reason || 'No reason provided'}\n**Moderator:** <@${warn.moderatorId}>`,
                    inline: false
                });
            }
            if (warns.length > 20) {
                embed.setFooter({ text: `Showing the 20 most recent of ${warns.length} warnings.` });
            }
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
