const { EmbedBuilder, COLORS, send } = require('../logging/logger');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const guild = newState.guild || oldState.guild;
        if (!guild) return;

        const member = newState.member || oldState.member;
        const user = member?.user;

        const base = () => {
            const embed = new EmbedBuilder().setTimestamp();
            if (user) {
                embed.setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() });
                embed.setFooter({ text: `ID: ${user.id}` });
            }
            return embed;
        };

        const oldCh = oldState.channelId;
        const newCh = newState.channelId;

        // Joined a voice channel.
        if (!oldCh && newCh) {
            const embed = base()
                .setColor(COLORS.green)
                .setDescription(`🔊 **Joined Voice**\n<@${user?.id}> joined <#${newCh}>`);
            return send(guild, 'voice', embed);
        }

        // Left a voice channel.
        if (oldCh && !newCh) {
            const embed = base()
                .setColor(COLORS.orange)
                .setDescription(`🔇 **Left Voice**\n<@${user?.id}> left <#${oldCh}>`);
            return send(guild, 'voice', embed);
        }

        // Moved between voice channels.
        if (oldCh && newCh && oldCh !== newCh) {
            const embed = base()
                .setColor(COLORS.blurple)
                .setDescription(`🔀 **Moved Voice Channels**\n<@${user?.id}> moved channels`)
                .addFields(
                    { name: 'From', value: `<#${oldCh}>`, inline: true },
                    { name: 'To', value: `<#${newCh}>`, inline: true },
                );
            return send(guild, 'voice', embed);
        }

        // Same channel: state changes (mute/deafen/stream/video).
        const changes = [];
        if (oldState.serverMute !== newState.serverMute) {
            changes.push(newState.serverMute ? 'Server muted' : 'Server unmuted');
        }
        if (oldState.serverDeaf !== newState.serverDeaf) {
            changes.push(newState.serverDeaf ? 'Server deafened' : 'Server undeafened');
        }
        if (oldState.selfMute !== newState.selfMute) {
            changes.push(newState.selfMute ? 'Muted themselves' : 'Unmuted themselves');
        }
        if (oldState.selfDeaf !== newState.selfDeaf) {
            changes.push(newState.selfDeaf ? 'Deafened themselves' : 'Undeafened themselves');
        }
        if (oldState.streaming !== newState.streaming) {
            changes.push(newState.streaming ? 'Started streaming' : 'Stopped streaming');
        }
        if (oldState.selfVideo !== newState.selfVideo) {
            changes.push(newState.selfVideo ? 'Turned camera on' : 'Turned camera off');
        }

        if (changes.length) {
            const embed = base()
                .setColor(COLORS.teal)
                .setDescription(`🎙️ **Voice State Updated**\n<@${user?.id}> in <#${newCh}>`)
                .addFields({ name: 'Changes', value: changes.join('\n'), inline: false });
            return send(guild, 'voice', embed);
        }
    },
};
