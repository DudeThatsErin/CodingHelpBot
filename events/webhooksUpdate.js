const { AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { EmbedBuilder, COLORS, send, userField } = require('../logging/logger');

const WEBHOOK_ACTIONS = new Set([
    AuditLogEvent.WebhookCreate,
    AuditLogEvent.WebhookUpdate,
    AuditLogEvent.WebhookDelete,
]);

// The webhooksUpdate gateway event only tells us *a* channel's webhooks changed,
// not what happened. We read the audit log to recover the details, and dedupe by
// audit-entry id because the event can fire several times for one action.
module.exports = {
    name: 'webhooksUpdate',
    async execute(channel, client) {
        const guild = channel?.guild;
        if (!guild) return;

        const me = guild.members.me;
        if (!me || !me.permissions.has(PermissionFlagsBits.ViewAuditLog)) return;

        // Per-client cache of audit entries we've already logged (id -> timestamp).
        if (!client._loggedWebhookEntries) client._loggedWebhookEntries = new Map();
        const seen = client._loggedWebhookEntries;
        const now = Date.now();
        // Prune entries older than 5 minutes so the map can't grow forever.
        for (const [id, ts] of seen) {
            if (now - ts > 5 * 60 * 1000) seen.delete(id);
        }

        let entries;
        try {
            const logs = await guild.fetchAuditLogs({ limit: 8 });
            entries = [...logs.entries.values()]
                .filter((e) => WEBHOOK_ACTIONS.has(e.action) && (now - e.createdTimestamp) < 15000)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        } catch {
            return;
        }

        for (const entry of entries) {
            if (seen.has(entry.id)) continue;
            seen.set(entry.id, now);
            await logWebhookEntry(guild, entry);
        }
    },
};

async function logWebhookEntry(guild, entry) {
    const moderator = entry.executor || null;
    const changes = entry.changes || [];

    // Resolve a friendly webhook name and target channel from the entry/changes.
    const nameChange = changes.find((c) => c.key === 'name');
    const channelChange = changes.find((c) => c.key === 'channel_id');
    const avatarChange = changes.find((c) => c.key === 'avatar_hash');

    const webhookName = entry.target?.name
        || nameChange?.new
        || nameChange?.old
        || 'Unknown Webhook';
    const channelId = entry.extra?.channel?.id
        || channelChange?.new
        || channelChange?.old
        || guild.channels.cache.find((ch) => ch.id === entry.targetId)?.id;

    const embed = new EmbedBuilder()
        .setFooter({ text: `ID: ${entry.id}` })
        .setTimestamp(entry.createdTimestamp);

    if (entry.action === AuditLogEvent.WebhookCreate) {
        embed.setColor(COLORS.green)
            .setDescription(`🪝 **Webhook Created**\n**${webhookName}** was created${channelId ? ` in <#${channelId}>` : ''}`)
            .addFields({ name: 'Created By', value: userField(moderator), inline: false });
    } else if (entry.action === AuditLogEvent.WebhookDelete) {
        embed.setColor(COLORS.red)
            .setDescription(`🪝 **Webhook Deleted**\n**${webhookName}** was deleted`)
            .addFields({ name: 'Deleted By', value: userField(moderator), inline: false });
    } else {
        // WebhookUpdate. An avatar change is logged as its own "Webhook Avatar
        // Updated" entry (like the reference screenshots); name/channel changes
        // are logged together as a "Webhook Modified" entry.
        const modifiedFields = [];
        if (nameChange) {
            modifiedFields.push({ name: 'Name', value: `\`${nameChange.old ?? 'None'}\` => \`${nameChange.new ?? 'None'}\``, inline: false });
        }
        if (channelChange) {
            modifiedFields.push({
                name: 'Channel',
                value: `${channelChange.old ? `<#${channelChange.old}>` : 'None'} => ${channelChange.new ? `<#${channelChange.new}>` : 'None'}`,
                inline: false,
            });
        }

        if (modifiedFields.length) {
            modifiedFields.push({ name: 'Updated By', value: userField(moderator), inline: false });
            embed.setColor(COLORS.purple)
                .setDescription(`🪝 **Webhook Modified**\n${moderator ? `<@${moderator.id}> modified ` : ''}the webhook **${webhookName}**`)
                .addFields(modifiedFields);
            await send(guild, 'server', embed);
        }

        if (avatarChange) {
            const avatarEmbed = new EmbedBuilder()
                .setColor(COLORS.pink)
                .setDescription(`🪝 **Webhook Avatar Updated**\n${moderator ? `<@${moderator.id}> ` : ''}added an avatar for **${webhookName}**`)
                .setFooter({ text: `ID: ${entry.id}` })
                .setTimestamp(entry.createdTimestamp);
            await send(guild, 'server', avatarEmbed);
        }

        return; // updates are handled and sent above
    }

    await send(guild, 'server', embed);
}
