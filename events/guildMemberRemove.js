const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField, timestamp, truncate } = require('../logging/logger');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const { guild, user } = member;

        // If this removal was actually a ban, the guildBanAdd handler logs it. Skip here.
        const banEntry = await fetchAuditEntry(guild, AuditLogEvent.MemberBanAdd, user.id, 6000);
        if (banEntry) return;

        // Detect kicks so they can be sent to modlogs instead of member-joins.
        const kickEntry = await fetchAuditEntry(guild, AuditLogEvent.MemberKick, user.id, 6000);

        if (kickEntry) {
            const moderator = kickEntry.executor || null;
            const reason = kickEntry.reason || '[no reason provided]';

            const embed = new EmbedBuilder()
                .setColor(COLORS.red)
                .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
                .setDescription('👢 **Kick**')
                .addFields(
                    { name: 'User', value: userField(user), inline: true },
                    { name: 'Moderator', value: userField(moderator), inline: true },
                    { name: 'Reason', value: truncate(reason), inline: false },
                )
                .setFooter({ text: `ID: ${user.id}` })
                .setTimestamp();

            await send(guild, 'modlogs', embed);
            return;
        }

        // Regular leave.
        const roles = member.roles?.cache
            ? member.roles.cache.filter((r) => r.id !== guild.id).map((r) => `<@&${r.id}>`)
            : [];

        const embed = new EmbedBuilder()
            .setColor(COLORS.orange)
            .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
            .setDescription(`🚪 **User Left**\n<@${user.id}> left the server`)
            .setFooter({ text: `Members: ${guild.memberCount} | ID: ${user.id}` })
            .setTimestamp();

        if (member.joinedTimestamp) {
            embed.addFields({
                name: 'Joined',
                value: `${timestamp(member.joinedTimestamp, 'F')} (${timestamp(member.joinedTimestamp, 'R')})`,
                inline: false,
            });
        }

        if (roles.length) {
            embed.addFields({ name: `Roles [${roles.length}]`, value: truncate(roles.join(', ')), inline: false });
        }

        await send(guild, 'members', embed);
    },
};
