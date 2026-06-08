const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

module.exports = {
    name: 'emojiDelete',
    async execute(emoji, client) {
        const entry = await fetchAuditEntry(emoji.guild, AuditLogEvent.EmojiDelete, emoji.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setDescription(`😀 **Emoji Deleted**\n\`:${emoji.name}:\` was removed`)
            .addFields({ name: 'Deleted By', value: userField(moderator), inline: false })
            .setFooter({ text: `ID: ${emoji.id}` })
            .setTimestamp();

        await send(emoji.guild, 'server', embed);
    },
};
