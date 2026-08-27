const { AuditLogEvent, PermissionsBitField } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, truncate } = require('../logging/logger');

// Turn a permission flag key (e.g. "SendTTSMessages") into "Send TTS Messages".
function humanizePermission(key) {
    return key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\bTts\b/i, 'TTS')
        .replace(/\bTTS\b/i, 'TTS');
}

// Permissions considered "dangerous" if newly granted.
const DANGEROUS = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'BanMembers', 'KickMembers', 'MentionEveryone'];

// State of a permission within an overwrite: 'allow' | 'deny' | 'neutral'.
function permState(overwrite, flag) {
    if (!overwrite) return 'neutral';
    if ((overwrite.allow.bitfield & flag) === flag) return 'allow';
    if ((overwrite.deny.bitfield & flag) === flag) return 'deny';
    return 'neutral';
}

const STATE_EMOJI = { allow: '✅', deny: '❌', neutral: '➖' };

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel, client) {
        if (!newChannel.guild) return;

        const fields = [];

        if (oldChannel.name !== newChannel.name) {
            fields.push({ name: 'Name', value: `\`${oldChannel.name}\` => \`${newChannel.name}\``, inline: false });
        }
        if ((oldChannel.topic || '') !== (newChannel.topic || '')) {
            fields.push({
                name: 'Topic',
                value: truncate(`\`${oldChannel.topic || 'None'}\` => \`${newChannel.topic || 'None'}\``),
                inline: false,
            });
        }
        if (oldChannel.nsfw !== newChannel.nsfw) {
            fields.push({ name: 'NSFW', value: `\`${oldChannel.nsfw}\` => \`${newChannel.nsfw}\``, inline: false });
        }
        if (oldChannel.parentId !== newChannel.parentId) {
            fields.push({
                name: 'Category',
                value: `${oldChannel.parentId ? `<#${oldChannel.parentId}>` : 'None'} => ${newChannel.parentId ? `<#${newChannel.parentId}>` : 'None'}`,
                inline: false,
            });
        }
        if ((oldChannel.rateLimitPerUser || 0) !== (newChannel.rateLimitPerUser || 0)) {
            fields.push({
                name: 'Slowmode',
                value: `\`${oldChannel.rateLimitPerUser || 0}s\` => \`${newChannel.rateLimitPerUser || 0}s\``,
                inline: false,
            });
        }
        if ((oldChannel.bitrate || 0) !== (newChannel.bitrate || 0)) {
            fields.push({ name: 'Bitrate', value: `\`${(oldChannel.bitrate || 0) / 1000}kbps\` => \`${(newChannel.bitrate || 0) / 1000}kbps\``, inline: false });
        }

        // --- Permission overwrite changes ---
        const permissionBlocks = [];
        let dangerousGranted = false;
        const oldOverwrites = oldChannel.permissionOverwrites?.cache;
        const newOverwrites = newChannel.permissionOverwrites?.cache;

        if (oldOverwrites && newOverwrites) {
            const targetIds = new Set([...oldOverwrites.keys(), ...newOverwrites.keys()]);

            for (const targetId of targetIds) {
                const oldOw = oldOverwrites.get(targetId);
                const newOw = newOverwrites.get(targetId);

                const changedLines = [];
                for (const [key, flag] of Object.entries(PermissionsBitField.Flags)) {
                    const oldS = permState(oldOw, flag);
                    const newS = permState(newOw, flag);
                    if (oldS !== newS) {
                        changedLines.push(`${STATE_EMOJI[newS]} ${humanizePermission(key)}`);
                        if (newS === 'allow' && DANGEROUS.includes(key)) dangerousGranted = true;
                    }
                }

                if (changedLines.length) {
                    const isRole = newChannel.guild.roles.cache.has(targetId) || oldChannel.guild.roles.cache.has(targetId);
                    const mention = isRole ? (targetId === newChannel.guild.id ? '@everyone' : `<@&${targetId}>`) : `<@${targetId}>`;
                    permissionBlocks.push({
                        name: `Permissions for ${mention}`,
                        value: truncate(changedLines.join('\n')),
                        inline: false,
                    });
                }
            }
        }

        if (!fields.length && !permissionBlocks.length) return;

        const entry = await fetchAuditEntry(newChannel.guild, AuditLogEvent.ChannelUpdate, newChannel.id)
            || await fetchAuditEntry(newChannel.guild, AuditLogEvent.ChannelOverwriteUpdate, newChannel.id);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(dangerousGranted ? COLORS.red : COLORS.purple)
            .setDescription(`#️⃣ **Channel Updated**\n${moderator ? `${moderator.username} (<@${moderator.id}>) updated ` : ''}<#${newChannel.id}>`)
            .addFields([...fields, ...permissionBlocks].slice(0, 24))
            .setFooter({ text: `ID: ${newChannel.id}` })
            .setTimestamp();

        if (dangerousGranted) {
            embed.addFields({ name: 'WARNING!', value: '```diff\n- Dangerous permissions granted\n```', inline: false });
        }

        await send(newChannel.guild, 'server', embed);
    },
};
