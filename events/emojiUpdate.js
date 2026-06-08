const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

module.exports = {
    name: 'emojiUpdate',
    async execute(oldEmoji, newEmoji, client) {
        if (oldEmoji.name === newEmoji.name) return;

        const entry = await fetchAuditEntry(newEmoji.guild, AuditLogEvent.EmojiUpdate, newEmoji.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(COLORS.pink)
            .setThumbnail(newEmoji.imageURL())
            .setDescription('😀 **Emoji Renamed**')
            .addFields(
                { name: 'Before', value: `\`:${oldEmoji.name}:\``, inline: true },
                { name: 'After', value: `\`:${newEmoji.name}:\``, inline: true },
                { name: 'Updated By', value: userField(moderator), inline: false },
            )
            .setFooter({ text: `ID: ${newEmoji.id}` })
            .setTimestamp();

        await send(newEmoji.guild, 'server', embed);
    },
};
