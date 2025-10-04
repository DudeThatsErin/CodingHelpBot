const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'dm',
    description: 'Sends an official DM to a specified user',
    modOnly: 1,
    options: [
        {
            name: 'user',
            description: 'The user to send a DM to',
            type: 6,
            required: true
        },
        {
            name: 'message',
            description: 'The message to send to the user',
            type: 3,
            required: true
        }
    ],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const saying = interaction.options.getString('message');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Our Website')
                    .setStyle(5)
                    .setURL('https://codinghelp.site'),
                new ButtonBuilder()
                    .setLabel('Our Subreddit')
                    .setStyle(5)
                    .setURL('https://reddit.com/r/CodingHelp')
            );

        const dm = {
            color: 0x1e1b49,
            title: `You received a DM from r/CodingHelp`,
            thumbnail: {
                url: 'https://imgur.com/U6cwQxj.png'
            },
            description: `${interaction.user} sent you the following message:\`\`\`${saying}\`\`\`\nIf you have any questions, please send a message to <@575252669443211264>.`,
            timestamp: new Date(),
            footer: {
                text: `This is not an official warning.`,
                icon_url: 'https://imgur.com/U6cwQxj.png'
            }
        };

        try {
            await user.send({ content: `Hey, ${user.username}!`, embeds: [dm], components: [row] });
            await interaction.reply({ 
                content: `✅ Successfully sent DM to ${user.username}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error sending DM:', error);
            await interaction.reply({ 
                content: `❌ Failed to send DM to ${user.username}. They may have DMs disabled.`, 
                ephemeral: true 
            });
        }
    }
};
