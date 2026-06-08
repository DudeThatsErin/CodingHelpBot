const { MessageFlags } = require('discord.js');

const MOD_ROLE = '780941276602302523';

module.exports = {
    name: 'close',
    description: 'Close the current ModMail ticket and notify the user.',
    usage: '/close [message]',
    example: '/close Closing this as your question has been answered.',
    options: [
        {
            name: 'message',
            description: 'Optional closing message / reason to send to the user.',
            required: false,
            type: 3
        },
        {
            name: 'anonymous',
            description: 'Send as "r/CodingHelp Mod Team" (true, default) or signed with your name (false).',
            required: false,
            type: 5
        }
    ],
    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(MOD_ROLE)) {
            return interaction.reply({ content: 'Only moderators can use this command.', flags: MessageFlags.Ephemeral });
        }

        await client.modMail.closeTicket(interaction);
    }
};
