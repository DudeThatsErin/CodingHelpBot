const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'review',
    description: 'Get a comprehensive code review with best practices.',
    options: [
        {
            name: 'code',
            description: 'The code you want reviewed (use code blocks)',
            required: true,
            type: 3
        },
        {
            name: 'language',
            description: 'Programming language',
            required: false,
            type: 3,
            choices: [
                { name: 'Python', value: 'python' },
                { name: 'JavaScript', value: 'javascript' },
                { name: 'Java', value: 'java' },
                { name: 'C++', value: 'cpp' },
                { name: 'C#', value: 'csharp' },
                { name: 'Other', value: 'other' }
            ]
        }
    ],
    usage: '/review <code> [language]',
    execute(interaction) {
        const code = interaction.options.getString('code');
        const language = interaction.options.getString('language') || 'general';

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle('📋 Code Review Checklist')
            .setDescription('Here\'s a comprehensive review framework for your code:')
            .addFields(
                {
                    name: '📝 Your Code',
                    value: code.length > 600 ? code.substring(0, 600) + '...' : code,
                    inline: false
                },
                {
                    name: '🔍 Code Quality Checklist',
                    value: '✅ **Functionality**: Does it work as intended?\n✅ **Readability**: Is it easy to understand?\n✅ **Maintainability**: Can it be easily modified?\n✅ **Performance**: Is it efficient enough?\n✅ **Security**: Are there any vulnerabilities?\n✅ **Testing**: Is it testable and tested?',
                    inline: false
                },
                {
                    name: '📐 Best Practices',
                    value: '• Use meaningful variable and function names\n• Keep functions small and focused\n• Add comments for complex logic\n• Follow consistent formatting\n• Handle errors appropriately\n• Avoid code duplication',
                    inline: false
                },
                {
                    name: '🎯 Review Questions',
                    value: '• Is the code self-documenting?\n• Are there any magic numbers or strings?\n• Could any part be simplified?\n• Are all edge cases handled?\n• Is error handling comprehensive?\n• Would a colleague understand this code?',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
