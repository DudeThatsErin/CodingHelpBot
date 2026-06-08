const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField, truncate } = require('../logging/logger');

module.exports = {
    name: 'guildBanRemove',
    async execute(ban, client) {
        const { guild, user } = ban;

        const entry = await fetchAuditEntry(guild, AuditLogEvent.MemberBanRemove, user.id);
        const moderator = entry?.executor || null;
        const reason = entry?.reason || '[no reason provided]';

        const embed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
            .setDescription('🔓 **Unban**')
            .addFields(
                { name: 'User', value: userField(user), inline: true },
                { name: 'Moderator', value: userField(moderator), inline: true },
                { name: 'Reason', value: truncate(reason), inline: false },
            )
            .setFooter({ text: `ID: ${user.id}` })
            .setTimestamp();

        await send(guild, 'modlogs', embed);
    },
};
