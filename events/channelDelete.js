const { AuditLogEvent, ChannelType } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

const TYPE_NAMES = {
    [ChannelType.GuildText]: 'Text Channel',
    [ChannelType.GuildVoice]: 'Voice Channel',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement Channel',
    [ChannelType.GuildStageVoice]: 'Stage Channel',
    [ChannelType.GuildForum]: 'Forum Channel',
};

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!channel.guild) return;

        const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.ChannelDelete, channel.id);
        const moderator = entry?.executor || null;
        const typeName = TYPE_NAMES[channel.type] || 'Channel';

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setDescription(`🗑️ **${typeName} Deleted**\n\`#${channel.name}\` was deleted`)
            .addFields({ name: 'Deleted By', value: userField(moderator), inline: false })
            .setFooter({ text: `ID: ${channel.id}` })
            .setTimestamp();

        await send(channel.guild, 'server', embed);
    },
};
