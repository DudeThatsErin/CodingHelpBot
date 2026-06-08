const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

module.exports = {
    name: 'roleDelete',
    async execute(role, client) {
        const entry = await fetchAuditEntry(role.guild, AuditLogEvent.RoleDelete, role.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setDescription(`🎭 **Role Deleted**\n\`${role.name}\` was deleted`)
            .addFields({ name: 'Deleted By', value: userField(moderator), inline: false })
            .setFooter({ text: `ID: ${role.id}` })
            .setTimestamp();

        await send(role.guild, 'server', embed);
    },
};
