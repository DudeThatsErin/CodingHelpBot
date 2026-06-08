/*
  r/CodingHelp - Shared logging helper
  Builds nicely formatted embeds (styled after the reference screenshots) and
  sends them to the correct log channel. All sends are best-effort and will
  never throw into the calling event handler.
*/
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
// Log channel IDs live in the main bot config alongside token/prefix.
const CHANNELS = require('../config/config.json');

// Softer, higher-contrast palette chosen to be easy on the eyes on Discord's
// dark theme (the old harsh red has been replaced with a muted rose).
const COLORS = {
    red: 0xE06C75,      // bans, leaves, deletions, dangerous changes (muted rose)
    green: 0x98C379,    // unbans, joins (soft green)
    yellow: 0xE5C07B,   // edits / generic server changes (warm sand)
    blurple: 0x7AA2F7,  // voice activity (soft periwinkle)
    grey: 0xABB2BF,     // neutral
    // Extra options you can use for finer-grained log styling.
    orange: 0xD19A66,   // warnings / cautionary changes
    teal: 0x56B6C2,     // info / state changes
    purple: 0xC678DD,   // role / permission changes
    pink: 0xE8A1C4,     // misc highlights
};

// Resolve a configured log channel for a guild. Returns null if not found.
function logChannel(guild, key) {
    const id = CHANNELS[key];
    if (!guild || !id) return null;
    return guild.channels.cache.get(id) || null;
}

// Send one or more embeds to a log channel. Best-effort, never throws.
async function send(guild, key, embeds) {
    const channel = logChannel(guild, key);
    if (!channel) return;
    try {
        await channel.send({ embeds: Array.isArray(embeds) ? embeds : [embeds] });
    } catch (error) {
        console.error(`[logger] Failed to send "${key}" log:`, error.message);
    }
}

// Look up the most recent matching audit log entry so we can attribute an
// action (ban/kick/delete/etc.) to a moderator. Best-effort.
async function fetchAuditEntry(guild, type, targetId = null, maxAgeMs = 10000) {
    try {
        const me = guild.members.me;
        if (!me || !me.permissions.has(PermissionFlagsBits.ViewAuditLog)) return null;

        const logs = await guild.fetchAuditLogs({ type, limit: 6 });
        return logs.entries.find((entry) =>
            (!targetId || entry.target?.id === targetId) &&
            (Date.now() - entry.createdTimestamp) < maxAgeMs
        ) || null;
    } catch {
        return null;
    }
}

// Standard "name (mention)" formatting used across logs. Falls back gracefully.
function userField(user) {
    if (!user) return 'Unknown';
    return `${user.username} (<@${user.id}>)`;
}

// Discord relative + full timestamp helper.
function timestamp(date, style = 'F') {
    const seconds = Math.floor(new Date(date).getTime() / 1000);
    return `<t:${seconds}:${style}>`;
}

// Trim long strings so they always fit inside an embed field.
function truncate(text, max = 1024) {
    if (!text) return text;
    return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

module.exports = {
    EmbedBuilder,
    COLORS,
    CHANNELS,
    send,
    fetchAuditEntry,
    userField,
    timestamp,
    truncate,
};
