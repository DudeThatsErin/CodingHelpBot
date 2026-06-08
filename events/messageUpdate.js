const { EmbedBuilder, COLORS, send, truncate } = require('../logging/logger');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (!newMessage.guild) return;
        if (newMessage.author?.bot) return;

        // Only log genuine content edits (ignore embed/link unfurls and pins).
        const before = oldMessage.content ?? '';
        const after = newMessage.content ?? '';
        if (before === after) return;

        const author = newMessage.author;
        // The edited message still exists, so this jumps directly to it.
        const jumpUrl = newMessage.url || `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;

        const embed = new EmbedBuilder()
            .setColor(COLORS.yellow)
            .setDescription('✏️ **Message Edited**')
            .addFields(
                { name: 'Before', value: truncate(before.length ? before : '[no content]'), inline: false },
                { name: 'After', value: truncate(after.length ? after : '[no content]'), inline: false },
                { name: 'Message Author', value: author ? `<@${author.id}>` : 'Unknown', inline: true },
                { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: true },
                { name: 'Context', value: `[Jump to context](${jumpUrl})`, inline: false },
            )
            .setFooter({ text: `ID: ${newMessage.id}` })
            .setTimestamp();

        if (author) {
            embed.setAuthor({ name: author.tag ?? author.username, iconURL: author.displayAvatarURL() });
        }

        await send(newMessage.guild, 'messages', embed);
    },
};
