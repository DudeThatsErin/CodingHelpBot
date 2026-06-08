const { MessageFlags } = require('discord.js');

const MOD_ROLE = '780941276602302523';

module.exports = {
    name: 'reply',
    description: 'Reply to the user in this ModMail ticket (sent to them as a DM).',
    usage: '/reply <message> [attachment] [anonymous]',
    example: '/reply Thanks for reaching out, we are looking into it!',
    options: [
        {
            name: 'message',
            description: 'The message to send to the user.',
            required: true,
            type: 3
        },
        {
            name: 'attachment',
            description: 'An optional file/image to send to the user.',
            required: false,
            type: 11
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

        const content = interaction.options.getString('message');
        const attachment = interaction.options.getAttachment('attachment');
        const anonymous = interaction.options.getBoolean('anonymous');

        await client.modMail.sendReply(interaction, content, attachment, anonymous === null ? true : anonymous);
    }
};
