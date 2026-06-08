const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Set the slowmode (rate limit) for a channel.',
    usage: '/slowmode <seconds> [channel]',
    example: '/slowmode 10',
    modOnly: 1,
    options: [
        { name: 'seconds', description: 'Seconds between messages (0 to disable, max 21600).', type: 4, required: true, min_value: 0, max_value: 21600 },
        { name: 'channel', description: 'The channel to apply slowmode to (defaults to here).', type: 7, required: false }
    ],
    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);
        } catch (error) {
            return interaction.reply({ content: `Failed to set slowmode: ${error.message}`, flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({
            content: seconds === 0
                ? `🐢 Slowmode disabled in <#${channel.id}>.`
                : `🐢 Slowmode set to **${seconds}s** in <#${channel.id}>.`
        });
    }
};
