const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField, truncate } = require('../logging/logger');

// Public ban-appeal form. Submissions ping the team in the appeals channel.
const APPEAL_URL = 'https://erinskidds.com/codinghelp/appeal';

// Best-effort DM to the banned user with a link to the appeal form. After a ban
// the user is no longer a guild member, so this may fail (e.g. closed DMs) — we
// never let that break the logging below.
async function sendAppealDM(user, guild) {
    try {
        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setTitle(`You have been banned from ${guild.name}`)
            .setDescription(
                'If you believe this was a mistake or would like to appeal, ' +
                `please fill out our ban appeal form:\n\n${APPEAL_URL}`,
            )
            .setTimestamp();
        await user.send({ embeds: [embed] });
    } catch (error) {
        console.error(`[guildBanAdd] Could not DM appeal link to ${user.id}:`, error.message);
    }
}

module.exports = {
    name: 'guildBanAdd',
    async execute(ban, client) {
        const { guild } = ban;
        // Fetch full ban to get the reason (guildBanAdd payload may be partial).
        const user = ban.user;

        const entry = await fetchAuditEntry(guild, AuditLogEvent.MemberBanAdd, user.id);
        const moderator = entry?.executor || null;
        const reason = entry?.reason || ban.reason || '[no reason provided]';

        await sendAppealDM(user, guild);

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
            .setDescription('🔨 **Ban**')
            .addFields(
                { name: 'User', value: userField(user), inline: true },
                { name: 'Moderator', value: userField(moderator), inline: true },
                { name: 'Reason', value: truncate(reason), inline: false },
                { name: 'Appeal Form', value: `[Submit a ban appeal](${APPEAL_URL})`, inline: false },
            )
            .setFooter({ text: `ID: ${user.id}` })
            .setTimestamp();

        await send(guild, 'modlogs', embed);
    },
};
