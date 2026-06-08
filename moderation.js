const {
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags
} = require('discord.js');
const logger = require('./logging/logger');
const { COLORS } = logger;
const { addWarn, getWarns, getWarnCount, deleteWarn } = require('./database-init.js');

// Channel key (in config/config.json) where moderation actions are logged.
const MODLOG_KEY = 'modlogs';

// Roles allowed to use moderation commands (Moderator + Junior Mod tiers).
const MOD_ROLES = ['780941276602302523', '822500305353703434', '718253309101867008', '751526654781685912'];

// Discord's maximum timeout length is 28 days.
const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

// Dates are stored/compared in UTC and formatted for display here.
function formatDate(ts) {
    if (!ts) return 'Unknown';
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-US', { timeZone: 'UTC' })}, ${d.toLocaleTimeString('en-US', { timeZone: 'UTC' })} UTC`;
}

// Parse a human duration like "10m", "2h", "1d", "1w", "30s" into milliseconds.
function parseDuration(input) {
    if (!input) return null;
    const match = String(input).trim().match(/^(\d+)\s*(s|sec|secs|m|min|mins|h|hr|hrs|d|day|days|w|wk|wks)$/i);
    if (!match) return null;
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const multipliers = {
        s: 1000, sec: 1000, secs: 1000,
        m: 60 * 1000, min: 60 * 1000, mins: 60 * 1000,
        h: 60 * 60 * 1000, hr: 60 * 60 * 1000, hrs: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000, day: 24 * 60 * 60 * 1000, days: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000, wk: 7 * 24 * 60 * 60 * 1000, wks: 7 * 24 * 60 * 60 * 1000
    };
    const ms = amount * (multipliers[unit] || 0);
    return ms > 0 ? ms : null;
}

// Human-readable duration from milliseconds.
function formatDuration(ms) {
    const units = [
        ['week', 7 * 24 * 60 * 60 * 1000],
        ['day', 24 * 60 * 60 * 1000],
        ['hour', 60 * 60 * 1000],
        ['minute', 60 * 1000],
        ['second', 1000]
    ];
    const parts = [];
    let remaining = ms;
    for (const [name, size] of units) {
        const value = Math.floor(remaining / size);
        if (value > 0) {
            parts.push(`${value} ${name}${value === 1 ? '' : 's'}`);
            remaining -= value * size;
        }
    }
    return parts.length ? parts.join(', ') : '0 seconds';
}

class ModerationManager {
    constructor(client) {
        this.client = client;
    }

    isMod(member) {
        if (!member || !member.roles) return false;
        return MOD_ROLES.some((id) => member.roles.cache.has(id));
    }

    // Check whether a moderator is allowed to act on a target member.
    canModerate(guild, moderator, targetMember) {
        if (!targetMember) return { ok: true };
        if (targetMember.id === guild.ownerId) {
            return { ok: false, reason: 'You cannot moderate the server owner.' };
        }
        if (moderator.id === targetMember.id) {
            return { ok: false, reason: 'You cannot moderate yourself.' };
        }
        if (targetMember.id === this.client.user.id) {
            return { ok: false, reason: 'I cannot moderate myself.' };
        }
        if (this.isMod(targetMember)) {
            return { ok: false, reason: 'You cannot use moderation commands on another moderator.' };
        }
        if (moderator.id !== guild.ownerId &&
            targetMember.roles.highest.comparePositionTo(moderator.roles.highest) >= 0) {
            return { ok: false, reason: 'You cannot moderate a member with an equal or higher role than you.' };
        }
        return { ok: true };
    }

    // Send a moderation log embed to the modlogs channel. Best-effort.
    async log(guild, { action, color, moderator, target, reason, fields = [] }) {
        const targetTag = target ? (target.tag || target.username || target.id) : 'Unknown';
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`Member ${action}`)
            .addFields(
                { name: 'User', value: `${targetTag} (${target ? target.id : 'Unknown'})`, inline: false },
                { name: 'Moderator', value: `${moderator.user ? moderator.user.tag : moderator.tag} (${moderator.id})`, inline: false },
                { name: 'Reason', value: reason || 'No reason provided', inline: false },
                ...fields
            )
            .setTimestamp();
        if (target && typeof target.displayAvatarURL === 'function') {
            embed.setThumbnail(target.displayAvatarURL());
        }
        await logger.send(guild, MODLOG_KEY, embed);
    }

    // DM the target user about an action. Best-effort, never throws.
    async dmTarget(user, { guildName, action, reason, extra }) {
        try {
            const embed = new EmbedBuilder()
                .setColor(COLORS.red)
                .setTitle(`You have been ${action} in ${guildName}`)
                .addFields({ name: 'Reason', value: reason || 'No reason provided', inline: false })
                .setTimestamp();
            if (extra) embed.addFields(extra);
            await user.send({ embeds: [embed] });
        } catch {
            /* user has DMs closed or no mutual server */
        }
    }

    async ban({ guild, moderator, targetUser, targetMember, reason, deleteDays = 0 }) {
        const check = this.canModerate(guild, moderator, targetMember);
        if (!check.ok) return { success: false, message: check.reason };

        if (targetMember && !targetMember.bannable) {
            return { success: false, message: 'I cannot ban this member. My role may be too low or I lack the Ban Members permission.' };
        }

        const deleteMessageSeconds = Math.min(Math.max(parseInt(deleteDays, 10) || 0, 0), 7) * 24 * 60 * 60;

        await this.dmTarget(targetUser, { guildName: guild.name, action: 'banned', reason });

        try {
            await guild.members.ban(targetUser.id, { reason: `${moderator.user.tag}: ${reason || 'No reason provided'}`, deleteMessageSeconds });
        } catch (error) {
            return { success: false, message: `Failed to ban: ${error.message}` };
        }

        await this.log(guild, {
            action: 'Banned', color: COLORS.red, moderator, target: targetUser, reason,
            fields: deleteMessageSeconds > 0 ? [{ name: 'Messages Deleted', value: `Last ${deleteMessageSeconds / 86400} day(s)`, inline: true }] : []
        });

        return { success: true, message: `🔨 **${targetUser.tag}** has been banned.` };
    }

    async unban({ guild, moderator, userId, reason }) {
        let bannedUser = null;
        try {
            const ban = await guild.bans.fetch(userId).catch(() => null);
            if (!ban) return { success: false, message: 'That user is not banned (or the ID is invalid).' };
            bannedUser = ban.user;
            await guild.bans.remove(userId, `${moderator.user.tag}: ${reason || 'No reason provided'}`);
        } catch (error) {
            return { success: false, message: `Failed to unban: ${error.message}` };
        }

        await this.log(guild, { action: 'Unbanned', color: COLORS.green, moderator, target: bannedUser, reason });
        return { success: true, message: `♻️ **${bannedUser.tag}** has been unbanned.` };
    }

    async kick({ guild, moderator, targetMember, reason }) {
        if (!targetMember) return { success: false, message: 'That user is not a member of this server.' };
        const check = this.canModerate(guild, moderator, targetMember);
        if (!check.ok) return { success: false, message: check.reason };
        if (!targetMember.kickable) {
            return { success: false, message: 'I cannot kick this member. My role may be too low or I lack the Kick Members permission.' };
        }

        await this.dmTarget(targetMember.user, { guildName: guild.name, action: 'kicked', reason });

        try {
            await targetMember.kick(`${moderator.user.tag}: ${reason || 'No reason provided'}`);
        } catch (error) {
            return { success: false, message: `Failed to kick: ${error.message}` };
        }

        await this.log(guild, { action: 'Kicked', color: COLORS.orange, moderator, target: targetMember.user, reason });
        return { success: true, message: `👢 **${targetMember.user.tag}** has been kicked.` };
    }

    async timeout({ guild, moderator, targetMember, durationMs, reason }) {
        if (!targetMember) return { success: false, message: 'That user is not a member of this server.' };
        const check = this.canModerate(guild, moderator, targetMember);
        if (!check.ok) return { success: false, message: check.reason };
        if (!targetMember.moderatable) {
            return { success: false, message: 'I cannot timeout this member. My role may be too low or I lack the Moderate Members permission.' };
        }
        if (!durationMs || durationMs <= 0) {
            return { success: false, message: 'Invalid duration. Use formats like `10m`, `2h`, `1d`, or `1w`.' };
        }
        if (durationMs > MAX_TIMEOUT_MS) {
            return { success: false, message: 'Timeout cannot be longer than 28 days.' };
        }

        const until = Date.now() + durationMs;
        await this.dmTarget(targetMember.user, {
            guildName: guild.name, action: 'timed out', reason,
            extra: { name: 'Expires', value: formatDate(until), inline: false }
        });

        try {
            await targetMember.timeout(durationMs, `${moderator.user.tag}: ${reason || 'No reason provided'}`);
        } catch (error) {
            return { success: false, message: `Failed to timeout: ${error.message}` };
        }

        await this.log(guild, {
            action: 'Timed Out', color: COLORS.yellow, moderator, target: targetMember.user, reason,
            fields: [
                { name: 'Duration', value: formatDuration(durationMs), inline: true },
                { name: 'Expires', value: formatDate(until), inline: true }
            ]
        });
        return { success: true, message: `⏳ **${targetMember.user.tag}** has been timed out for ${formatDuration(durationMs)}.` };
    }

    async untimeout({ guild, moderator, targetMember, reason }) {
        if (!targetMember) return { success: false, message: 'That user is not a member of this server.' };
        if (!targetMember.isCommunicationDisabled || !targetMember.isCommunicationDisabled()) {
            return { success: false, message: 'That member is not currently timed out.' };
        }
        if (!targetMember.moderatable) {
            return { success: false, message: 'I cannot edit this member. My role may be too low or I lack the Moderate Members permission.' };
        }

        try {
            await targetMember.timeout(null, `${moderator.user.tag}: ${reason || 'Timeout removed'}`);
        } catch (error) {
            return { success: false, message: `Failed to remove timeout: ${error.message}` };
        }

        await this.log(guild, { action: 'Timeout Removed', color: COLORS.teal, moderator, target: targetMember.user, reason });
        return { success: true, message: `✅ Timeout removed from **${targetMember.user.tag}**.` };
    }

    async warn({ guild, moderator, targetUser, targetMember, reason }) {
        const check = this.canModerate(guild, moderator, targetMember);
        if (!check.ok) return { success: false, message: check.reason };

        const id = await addWarn(targetUser.id, guild.id, moderator.id, reason);
        if (id === null) return { success: false, message: 'Failed to save the warning to the database.' };

        const count = await getWarnCount(targetUser.id, guild.id);

        await this.dmTarget(targetUser, {
            guildName: guild.name, action: 'warned', reason,
            extra: { name: 'Total Warnings', value: `${count}`, inline: false }
        });

        await this.log(guild, {
            action: 'Warned', color: COLORS.orange, moderator, target: targetUser, reason,
            fields: [
                { name: 'Warning ID', value: `#${id}`, inline: true },
                { name: 'Total Warnings', value: `${count}`, inline: true }
            ]
        });
        return { success: true, message: `⚠️ **${targetUser.tag}** has been warned. They now have **${count}** warning(s).` };
    }

    // Build a detailed info embed for a user (used by the /userinfo command and context menu).
    async buildUserInfoEmbed(guild, targetUser, targetMember) {
        const warnCount = await getWarnCount(targetUser.id, guild.id);

        const embed = new EmbedBuilder()
            .setColor(COLORS.teal)
            .setTitle(`User Info: ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: 'User', value: `<@${targetUser.id}>`, inline: true },
                { name: 'ID', value: targetUser.id, inline: true },
                { name: 'Bot', value: targetUser.bot ? 'Yes' : 'No', inline: true },
                { name: 'Account Created', value: formatDate(targetUser.createdTimestamp), inline: false },
                { name: 'Warnings', value: `${warnCount}`, inline: true }
            )
            .setTimestamp();

        if (targetMember) {
            embed.addFields({ name: 'Joined Server', value: formatDate(targetMember.joinedTimestamp), inline: false });

            const roles = targetMember.roles.cache
                .filter((r) => r.id !== guild.id)
                .sort((a, b) => b.position - a.position)
                .map((r) => `<@&${r.id}>`);
            embed.addFields({
                name: `Roles (${roles.length})`,
                value: roles.length ? roles.slice(0, 25).join(' ') : 'None',
                inline: false
            });

            if (targetMember.isCommunicationDisabled && targetMember.isCommunicationDisabled()) {
                embed.addFields({ name: 'Timed Out Until', value: formatDate(targetMember.communicationDisabledUntilTimestamp), inline: false });
            }
        } else {
            embed.addFields({ name: 'Membership', value: 'Not in this server.', inline: false });
        }

        return embed;
    }

    // ----- Context-menu modal helpers -----

    // Build & show the modal for a context-menu moderation action.
    async showActionModal(interaction, action, targetUser) {
        const titles = { ban: 'Ban User', kick: 'Kick User', timeout: 'Timeout User', warn: 'Warn User' };
        const modal = new ModalBuilder()
            .setCustomId(`mod_${action}_${targetUser.id}`)
            .setTitle(`${titles[action]}: ${targetUser.username}`.slice(0, 45));

        const reasonInput = new TextInputBuilder()
            .setCustomId('reason')
            .setLabel('Reason')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500)
            .setPlaceholder('Reason for this action (optional)');

        const rows = [new ActionRowBuilder().addComponents(reasonInput)];

        if (action === 'timeout') {
            const durationInput = new TextInputBuilder()
                .setCustomId('duration')
                .setLabel('Duration (e.g. 10m, 2h, 1d, 1w)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(10)
                .setPlaceholder('1h');
            rows.push(new ActionRowBuilder().addComponents(durationInput));
        }

        if (action === 'ban') {
            const deleteInput = new TextInputBuilder()
                .setCustomId('deletedays')
                .setLabel('Delete message history (0-7 days)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(1)
                .setPlaceholder('0');
            rows.push(new ActionRowBuilder().addComponents(deleteInput));
        }

        modal.addComponents(...rows);
        await interaction.showModal(modal);
    }

    // Handle a submitted moderation modal (customId: mod_<action>_<targetId>).
    async handleModal(interaction) {
        if (!this.isMod(interaction.member)) {
            return interaction.reply({ content: 'You do not have permission to use moderation commands.', flags: MessageFlags.Ephemeral });
        }

        const [, action, targetId] = interaction.customId.split('_');
        const reason = interaction.fields.getTextInputValue('reason') || null;
        const guild = interaction.guild;
        const moderator = interaction.member;

        const targetUser = await this.client.users.fetch(targetId).catch(() => null);
        const targetMember = await guild.members.fetch(targetId).catch(() => null);

        if (!targetUser) {
            return interaction.reply({ content: 'Could not find that user.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let result;
        if (action === 'ban') {
            const deleteDays = interaction.fields.getTextInputValue('deletedays');
            result = await this.ban({ guild, moderator, targetUser, targetMember, reason, deleteDays });
        } else if (action === 'kick') {
            result = await this.kick({ guild, moderator, targetMember, reason });
        } else if (action === 'timeout') {
            const durationMs = parseDuration(interaction.fields.getTextInputValue('duration'));
            result = await this.timeout({ guild, moderator, targetMember, durationMs, reason });
        } else if (action === 'warn') {
            result = await this.warn({ guild, moderator, targetUser, targetMember, reason });
        } else {
            result = { success: false, message: 'Unknown moderation action.' };
        }

        await interaction.editReply({ content: result.message });
    }
}

module.exports = ModerationManager;
module.exports.parseDuration = parseDuration;
module.exports.formatDuration = formatDuration;
module.exports.formatDate = formatDate;
module.exports.MOD_ROLES = MOD_ROLES;
