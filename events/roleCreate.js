const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

module.exports = {
    name: 'roleCreate',
    async execute(role, client) {
        const entry = await fetchAuditEntry(role.guild, AuditLogEvent.RoleCreate, role.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setDescription(`🎭 **Role Created**\n<@&${role.id}> (\`${role.name}\`) was created`)
            .addFields({ name: 'Created By', value: userField(moderator), inline: false })
            .setFooter({ text: `ID: ${role.id}` })
            .setTimestamp();

        await send(role.guild, 'server', embed);
    },
};
