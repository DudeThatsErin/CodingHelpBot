const { EmbedBuilder, COLORS, send, timestamp } = require('../logging/logger');

const NEW_ACCOUNT_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const { guild, user } = member;

        const accountAge = Date.now() - user.createdTimestamp;
        const isNewAccount = accountAge < NEW_ACCOUNT_THRESHOLD;

        const embed = new EmbedBuilder()
            .setColor(COLORS.green)
            .setAuthor({ name: user.tag ?? user.username, iconURL: user.displayAvatarURL() })
            .setDescription(`👋 **User Joined**\n<@${user.id}> joined the server`)
            .addFields(
                {
                    name: 'Account Created',
                    value: `${timestamp(user.createdTimestamp, 'F')} (${timestamp(user.createdTimestamp, 'R')})`,
                    inline: false,
                },
            )
            .setFooter({ text: `Members: ${guild.memberCount} | ID: ${user.id}` })
            .setTimestamp();

        if (isNewAccount) {
            embed.addFields({
                name: 'Info',
                value: '```diff\n- New account (created less than 7 days ago)\n```',
                inline: false,
            });
        }

        await send(guild, 'members', embed);
    },
};
