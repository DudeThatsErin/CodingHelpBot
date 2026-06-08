const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Lock a channel so @everyone cannot send messages.',
    usage: '/lock [channel] [reason]',
    example: '/lock #general Raid',
    modOnly: 1,
    options: [
        { name: 'channel', description: 'The channel to lock (defaults to here).', type: 7, required: false },
        { name: 'reason', description: 'Reason for locking.', type: 3, required: false }
    ],
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, { reason: `Locked by ${interaction.user.tag}: ${reason}` });
        } catch (error) {
            return interaction.reply({ content: `Failed to lock the channel: ${error.message}`, flags: MessageFlags.Ephemeral });
        }

        await interaction.reply({ content: `🔒 <#${channel.id}> has been locked.` });
    }
};
