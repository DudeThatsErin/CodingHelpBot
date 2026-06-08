const { AuditLogEvent, PermissionsBitField } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, truncate } = require('../logging/logger');

function humanizePermission(key) {
    return key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\bTts\b/i, 'TTS');
}

const DANGEROUS = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'BanMembers', 'KickMembers', 'MentionEveryone'];

module.exports = {
    name: 'roleUpdate',
    async execute(oldRole, newRole, client) {
        const fields = [];

        if (oldRole.name !== newRole.name) {
            fields.push({ name: 'Name', value: `\`${oldRole.name}\` => \`${newRole.name}\``, inline: false });
        }
        if (oldRole.hexColor !== newRole.hexColor) {
            fields.push({ name: 'Color', value: `\`${oldRole.hexColor}\` => \`${newRole.hexColor}\``, inline: false });
        }
        if (oldRole.hoist !== newRole.hoist) {
            fields.push({ name: 'Hoisted', value: `\`${oldRole.hoist}\` => \`${newRole.hoist}\``, inline: false });
        }
        if (oldRole.mentionable !== newRole.mentionable) {
            fields.push({ name: 'Mentionable', value: `\`${oldRole.mentionable}\` => \`${newRole.mentionable}\``, inline: false });
        }

        // Permission changes
        const oldPerms = oldRole.permissions.bitfield;
        const newPerms = newRole.permissions.bitfield;
        let dangerousGranted = false;

        if (oldPerms !== newPerms) {
            const added = [];
            const removed = [];
            for (const [key, flag] of Object.entries(PermissionsBitField.Flags)) {
                const had = (oldPerms & flag) === flag;
                const has = (newPerms & flag) === flag;
                if (!had && has) {
                    added.push(`✅ ${humanizePermission(key)}`);
                    if (DANGEROUS.includes(key)) dangerousGranted = true;
                } else if (had && !has) {
                    removed.push(`❌ ${humanizePermission(key)}`);
                }
            }
            if (added.length) fields.push({ name: 'Permissions Granted', value: truncate(added.join('\n')), inline: false });
            if (removed.length) fields.push({ name: 'Permissions Removed', value: truncate(removed.join('\n')), inline: false });
        }

        if (!fields.length) return;

        const entry = await fetchAuditEntry(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(dangerousGranted ? COLORS.red : COLORS.purple)
            .setDescription(`🎭 **Role Updated**\n${moderator ? `<@${moderator.id}> updated ` : ''}<@&${newRole.id}> (\`${newRole.name}\`)`)
            .addFields(fields.slice(0, 24))
            .setFooter({ text: `ID: ${newRole.id}` })
            .setTimestamp();

        if (dangerousGranted) {
            embed.addFields({ name: 'WARNING!', value: '```diff\n- Dangerous permissions granted\n```', inline: false });
        }

        await send(newRole.guild, 'server', embed);
    },
};
