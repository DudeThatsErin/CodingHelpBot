const { AuditLogEvent } = require('discord.js');
const { EmbedBuilder, COLORS, send, fetchAuditEntry, userField } = require('../logging/logger');

const VERIFICATION_LEVELS = ['None', 'Low', 'Medium', 'High', 'Very High'];

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild, client) {
        const changes = [];

        if (oldGuild.name !== newGuild.name) {
            changes.push({ name: 'Name', value: `\`${oldGuild.name}\` => \`${newGuild.name}\`` });
        }
        if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
            changes.push({
                name: 'Verification Level',
                value: `\`${VERIFICATION_LEVELS[oldGuild.verificationLevel] ?? oldGuild.verificationLevel}\` => \`${VERIFICATION_LEVELS[newGuild.verificationLevel] ?? newGuild.verificationLevel}\``,
            });
        }
        if (oldGuild.ownerId !== newGuild.ownerId) {
            changes.push({ name: 'Owner', value: `<@${oldGuild.ownerId}> => <@${newGuild.ownerId}>` });
        }
        if (oldGuild.icon !== newGuild.icon) {
            changes.push({ name: 'Icon', value: 'Server icon was changed' });
        }
        if (oldGuild.banner !== newGuild.banner) {
            changes.push({ name: 'Banner', value: 'Server banner was changed' });
        }
        if (oldGuild.afkChannelId !== newGuild.afkChannelId) {
            changes.push({
                name: 'AFK Channel',
                value: `${oldGuild.afkChannelId ? `<#${oldGuild.afkChannelId}>` : 'None'} => ${newGuild.afkChannelId ? `<#${newGuild.afkChannelId}>` : 'None'}`,
            });
        }
        if (oldGuild.systemChannelId !== newGuild.systemChannelId) {
            changes.push({
                name: 'System Channel',
                value: `${oldGuild.systemChannelId ? `<#${oldGuild.systemChannelId}>` : 'None'} => ${newGuild.systemChannelId ? `<#${newGuild.systemChannelId}>` : 'None'}`,
            });
        }

        if (!changes.length) return;

        const entry = await fetchAuditEntry(newGuild, AuditLogEvent.GuildUpdate);
        const moderator = entry?.executor || null;

        const embed = new EmbedBuilder()
            .setColor(COLORS.yellow)
            .setAuthor({ name: newGuild.name, iconURL: newGuild.iconURL() ?? undefined })
            .setDescription(`🛠️ **Server Modified**${moderator ? `\nThis server was modified by <@${moderator.id}>` : ''}`)
            .addFields(changes.map((c) => ({ ...c, inline: false })))
            .setFooter({ text: `ID: ${newGuild.id}` })
            .setTimestamp();

        await send(newGuild, 'server', embed);
    },
};
