const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Unlock a previously locked channel.',
    usage: '/unlock [channel]',
    example: '/unlock #general',
    modOnly: 1,
    options: [
        { name: 'channel', description: 'The channel to unlock (defaults to here).', type: 7, required: false }
    ],
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }, { reason: `Unlocked by ${interaction.user.tag}` });
        } catch (error) {
            return interaction.reply({ content: `Failed to unlock the channel: ${error.message}`, flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: `🔓 <#${channel.id}> has been unlocked.` });
    }
};
