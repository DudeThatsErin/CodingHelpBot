const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField, timestamp, truncate } = require('../logging/logger');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember, client) {
        const { guild, user } = newMember;

        // --- Timeout (mute / unmute) -> modlogs ---
        const oldTimeout = oldMember.communicationDisabledUntilTimestamp || 0;
        const newTimeout = newMember.communicationDisabledUntilTimestamp || 0;
        const now = Date.now();

        if (newTimeout !== oldTimeout) {
            const entry = await fetchAuditEntry(guild, AuditLogEvent.MemberUpdate, user.id);
            const moderator = entry?.executor || null;
            const reason = entry?.reason || '[no reason provided]';

            if (newTimeout > now && newTimeout > oldTimeout) {
                // Newly muted (or extended timeout).
                const embed = new EmbedBuilder()
                    .setColor(COLORS.red)
                    .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
                    .setDescription('🔇 **Mute (Timeout)**')
                    .addFields(
                        { name: 'User', value: userField(user), inline: true },
                        { name: 'Moderator', value: userField(moderator), inline: true },
                        { name: 'Expires', value: `${timestamp(newTimeout, 'F')} (${timestamp(newTimeout, 'R')})`, inline: false },
                        { name: 'Reason', value: truncate(reason), inline: false },
                    )
                    .setFooter({ text: `ID: ${user.id}` })
                    .setTimestamp();
                await send(guild, 'modlogs', embed);
            } else if (oldTimeout > now && (newTimeout === 0 || newTimeout < now)) {
                // Timeout removed early.
                const embed = new EmbedBuilder()
                    .setColor(COLORS.green)
                    .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
                    .setDescription('🔊 **Unmute (Timeout Removed)**')
                    .addFields(
                        { name: 'User', value: userField(user), inline: true },
                        { name: 'Moderator', value: userField(moderator), inline: true },
                    )
                    .setFooter({ text: `ID: ${user.id}` })
                    .setTimestamp();
                await send(guild, 'modlogs', embed);
            }
        }

        // --- Nickname change -> server-logs ---
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.yellow)
                .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
                .setDescription(`✏️ **Nickname Changed**\n<@${user.id}>'s nickname was updated`)
                .addFields(
                    { name: 'Before', value: `\`${oldMember.nickname || 'None'}\``, inline: true },
                    { name: 'After', value: `\`${newMember.nickname || 'None'}\``, inline: true },
                )
                .setFooter({ text: `ID: ${user.id}` })
                .setTimestamp();
            await send(guild, 'server', embed);
        }

        // --- Role changes -> server-logs ---
        const oldRoles = oldMember.roles?.cache;
        const newRoles = newMember.roles?.cache;
        if (oldRoles && newRoles) {
            const added = newRoles.filter((r) => !oldRoles.has(r.id)).map((r) => `<@&${r.id}>`);
            const removed = oldRoles.filter((r) => !newRoles.has(r.id)).map((r) => `<@&${r.id}>`);

            if (added.length || removed.length) {
                const entry = await fetchAuditEntry(guild, AuditLogEvent.MemberRoleUpdate, user.id);
                const moderator = entry?.executor || null;

                const embed = new EmbedBuilder()
                    .setColor(COLORS.purple)
                    .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
                    .setDescription(`🎭 **Roles Updated**\n<@${user.id}>'s roles were updated`)
                    .setFooter({ text: `ID: ${user.id}` })
                    .setTimestamp();

                if (added.length) {
                    embed.addFields({ name: `Added [${added.length}]`, value: truncate(added.join(', ')), inline: false });
                }
                if (removed.length) {
                    embed.addFields({ name: `Removed [${removed.length}]`, value: truncate(removed.join(', ')), inline: false });
                }
                if (moderator) {
                    embed.addFields({ name: 'Updated By', value: userField(moderator), inline: false });
                }

                await send(guild, 'server', embed);
            }
        }
    },
};
