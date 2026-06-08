const { EmbedBuilder, COLORS, send } = require('../logging/logger');

module.exports = {
    name: 'messageDeleteBulk',
    async execute(messages, channel, client) {
        const guild = channel?.guild;
        if (!guild) return;

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setDescription(`🗑️ **Bulk Message Delete**\n**${messages.size}** messages were deleted in <#${channel.id}>`)
            .setFooter({ text: `Channel ID: ${channel.id}` })
            .setTimestamp();

        await send(guild, 'messages', embed);
    },
};
