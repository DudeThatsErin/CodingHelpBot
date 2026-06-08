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
    name: 'channelCreate',
    async execute(channel, client) {
        if (!channel.guild) return;

        const entry = await fetchAuditEntry(channel.guild, AuditLogEvent.ChannelCreate, channel.id);
        const moderator = entry?.executor || null;
        const typeName = TYPE_NAMES[channel.type] || 'Channel';

        const embed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setDescription(`📁 **${typeName} Created**\n<#${channel.id}> (\`${channel.name}\`) was created`)
            .addFields({ name: 'Created By', value: userField(moderator), inline: false })
            .setFooter({ text: `ID: ${channel.id}` })
            .setTimestamp();

        await send(channel.guild, 'server', embed);
    },
};
