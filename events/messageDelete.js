const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, truncate } = require('../logging/logger');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        // Ignore DMs and bot messages.
        if (!message.guild) return;
        if (message.author?.bot) return;

        const author = message.author;
        const content = message.content && message.content.length ? message.content : '[no content]';

        // Best-effort: figure out who deleted it (self vs moderator).
        let deletedBy = null;
        if (author) {
            const entry = await fetchAuditEntry(message.guild, AuditLogEvent.MessageDelete, author.id, 6000);
            if (entry && entry.extra?.channel?.id === message.channel.id) {
                deletedBy = entry.executor;
            }
        }

        // Even though the message is gone, this URL jumps to the closest message
        // (the surrounding context) in the channel where it was deleted.
        const jumpUrl = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setDescription(`🗑️ **Message Deleted**\n${truncate(content, 2000)}`)
            .addFields(
                { name: 'Message Author', value: author ? `<@${author.id}>` : 'Unknown', inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Context', value: `[Jump to context](${jumpUrl})`, inline: false },
            )
            .setFooter({ text: `ID: ${message.id}` })
            .setTimestamp();

        if (author) {
            embed.setAuthor({ name: author.tag ?? author.username, iconURL: author.displayAvatarURL() });
        }
        if (deletedBy && deletedBy.id !== author?.id) {
            embed.addFields({ name: 'Deleted By', value: `<@${deletedBy.id}>`, inline: true });
        }
        if (message.attachments && message.attachments.size) {
            embed.addFields({
                name: `Attachments [${message.attachments.size}]`,
                value: truncate(message.attachments.map((a) => a.url).join('\n')),
                inline: false,
            });
        }

        await send(message.guild, 'messages', embed);
    },
};
