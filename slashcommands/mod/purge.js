const { EmbedBuilder, MessageFlags } = require('discord.js');
const logger = require('../../logging/logger');
const { COLORS } = logger;

module.exports = {
    name: 'purge',
    description: 'Bulk-delete recent messages in this channel.',
    usage: '/purge <amount> [user]',
    example: '/purge 20',
    modOnly: 1,
    options: [
        { name: 'amount', description: 'How many messages to delete (1-100).', type: 4, required: true, min_value: 1, max_value: 100 },
        { name: 'user', description: 'Only delete messages from this user.', type: 6, required: false }
    ],
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let messages = await interaction.channel.messages.fetch({ limit: 100 });
        if (user) messages = messages.filter((m) => m.author.id === user.id);

        const toDelete = [...messages.values()].slice(0, amount);

        let deleted;
        try {
            deleted = await interaction.channel.bulkDelete(toDelete, true);
        } catch (error) {
            return interaction.editReply({ content: `Failed to purge messages: ${error.message}` });
        }

        const embed = new EmbedBuilder()
            .setColor(COLORS.red)
            .setTitle('Messages Purged')
            .addFields(
                { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
                { name: 'Deleted', value: `${deleted.size}`, inline: true },
                { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false }
            )
            .setTimestamp();
        if (user) embed.addFields({ name: 'Filtered to', value: `${user.tag}`, inline: true });
        await logger.send(interaction.guild, 'modlogs', embed);

        await interaction.editReply({ content: `🧹 Deleted **${deleted.size}** message(s).${deleted.size < amount ? ' Some messages may be older than 14 days and could not be deleted.' : ''}` });
    }
};
