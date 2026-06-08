const { MessageFlags } = require('discord.js');
const { deleteWarn } = require('../../database-init.js');

module.exports = {
    name: 'delwarn',
    description: 'Delete a warning by its ID.',
    usage: '/delwarn <id>',
    example: '/delwarn 42',
    modOnly: 1,
    options: [
        { name: 'id', description: 'The warning ID (shown in /warnings).', type: 4, required: true, min_value: 1 }
    ],
    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const removed = await deleteWarn(id, interaction.guild.id);

        await interaction.reply({
            content: removed ? `🗑️ Warning **#${id}** has been deleted.` : `No warning found with ID **#${id}** in this server.`,
            flags: MessageFlags.Ephemeral
        });
    }
};
