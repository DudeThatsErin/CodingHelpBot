const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

module.exports = {
    name: 'emojiCreate',
    async execute(emoji, client) {
        const entry = await fetchAuditEntry(emoji.guild, AuditLogEvent.EmojiCreate, emoji.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(COLORS.pink)
            .setThumbnail(emoji.imageURL())
            .setDescription(`😀 **Emoji Created**\n\`:${emoji.name}:\` was added`)
            .addFields({ name: 'Created By', value: userField(moderator), inline: false })
            .setFooter({ text: `ID: ${emoji.id}` })
            .setTimestamp();

        await send(emoji.guild, 'server', embed);
    },
};
